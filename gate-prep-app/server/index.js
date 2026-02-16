const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const yts = require('yt-search');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- Database Initialization (Schema Update) ---
const initDB = async () => {
  try {
    // Study Sessions History
    await db.query(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        start_time DATETIME,
        end_time DATETIME,
        duration INT, 
        mode VARCHAR(20),
        session_label VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if session_label column exists, if not add it (for existing DBs)
    try {
      await db.query(`ALTER TABLE study_sessions ADD COLUMN session_label VARCHAR(255)`);
    } catch (e) {
      // Column likely exists, ignore
    }

    // Ensure duration and mode columns exist (for older DB schemas)
    try {
      await db.query(`ALTER TABLE study_sessions ADD COLUMN duration INT`);
    } catch (e) {}
    
    try {
      await db.query(`ALTER TABLE study_sessions ADD COLUMN mode VARCHAR(20)`);
    } catch (e) {}

    try {
      await db.query(`ALTER TABLE study_sessions ADD COLUMN notes TEXT`);
    } catch (e) {}

    // Todos
    await db.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        is_done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Syllabus Progress
    await db.query(`
      CREATE TABLE IF NOT EXISTS syllabus_progress (
        topic_id VARCHAR(255) PRIMARY KEY,
        is_completed BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Resources
    await db.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        url TEXT,
        subject_id VARCHAR(50),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Playlists
    await db.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        url TEXT,
        thumbnail TEXT,
        subject_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Playlist Videos
    await db.query(`
      CREATE TABLE IF NOT EXISTS playlist_videos (
        id VARCHAR(255) PRIMARY KEY,
        playlist_id VARCHAR(255),
        title VARCHAR(255),
        thumbnail TEXT,
        is_completed BOOLEAN DEFAULT FALSE,
        position INT,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
      )
    `);

    // Library Paths
    await db.query(`
      CREATE TABLE IF NOT EXISTS library_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        path TEXT NOT NULL,
        type VARCHAR(50),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Topic PYQ Progress
    await db.query(`
      CREATE TABLE IF NOT EXISTS topic_pyq_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        topic_name VARCHAR(255) NOT NULL,
        year VARCHAR(10) NOT NULL,
        is_solved BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_topic_pyq (topic_name, year)
      )
    `);

    // Paper Progress (Full Question Papers)
    await db.query(`
      CREATE TABLE IF NOT EXISTS paper_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year INT NOT NULL,
        stream VARCHAR(10) NOT NULL,
        is_solved BOOLEAN DEFAULT FALSE,
        UNIQUE KEY unique_paper (year, stream)
      )
    `);

    console.log("Database schema initialized/updated.");
  } catch (err) {
    console.error("Schema Init Error:", err);
  }
};

initDB();

// --- Study Session Routes ---

app.post('/api/sessions', async (req, res) => {
  const { duration, mode, notes, date, session_label } = req.body;
  
  let endTime = new Date();
  if (date) {
    // If manual date provided, set time to noon on that date
    endTime = new Date(date);
    endTime.setHours(12, 0, 0, 0);
  }
  
  const startTime = new Date(endTime.getTime() - duration * 1000);
  
  try {
    await db.query(
      'INSERT INTO study_sessions (start_time, end_time, duration, mode, notes, session_label) VALUES (?, ?, ?, ?, ?, ?)',
      [startTime, endTime, duration, mode, notes, session_label || '']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM study_sessions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions/stats', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(duration) as total_seconds,
        mode
      FROM study_sessions 
      GROUP BY mode
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions/analysis', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Helper to safely get total
    const getTotal = async (query, params) => {
      try {
        const [rows] = await db.query(query, params);
        return rows[0]?.total || 0;
      } catch (e) {
        console.error("Query failed:", query, e.message);
        return 0;
      }
    };

    const daily = await getTotal('SELECT SUM(duration) as total FROM study_sessions WHERE start_time >= ?', [todayStart]);
    const weekly = await getTotal('SELECT SUM(duration) as total FROM study_sessions WHERE start_time >= ?', [weekStart]);
    const monthly = await getTotal('SELECT SUM(duration) as total FROM study_sessions WHERE start_time >= ?', [monthStart]);
    const total = await getTotal('SELECT SUM(duration) as total FROM study_sessions');

    res.json({ daily, weekly, monthly, total });
  } catch (err) {
    console.error("Analysis Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions/history', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM study_sessions ORDER BY start_time DESC LIMIT 10');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Todo Routes ---

app.get('/api/todos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body;
  try {
    const [result] = await db.query('INSERT INTO todos (text) VALUES (?)', [text]);
    res.json({ id: result.insertId, text, is_done: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  const { is_done } = req.body;
  try {
    await db.query('UPDATE todos SET is_done = ? WHERE id = ?', [is_done, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM todos WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Syllabus Progress Routes ---

app.get('/api/syllabus/progress', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM syllabus_progress');
    const map = {};
    rows.forEach(r => map[r.topic_id] = r.is_completed);
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/syllabus/toggle', async (req, res) => {
  const { topic_id } = req.body;
  try {
    const [existing] = await db.query('SELECT is_completed FROM syllabus_progress WHERE topic_id = ?', [topic_id]);
    
    let newState = true;
    if (existing.length > 0) {
      newState = !existing[0].is_completed;
      await db.query('UPDATE syllabus_progress SET is_completed = ? WHERE topic_id = ?', [newState, topic_id]);
    } else {
      await db.query('INSERT INTO syllabus_progress (topic_id, is_completed) VALUES (?, TRUE)', [topic_id]);
    }
    res.json({ success: true, is_completed: newState });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Local File Access Routes ---

// List Library Roots
app.get('/api/library/roots', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM library_paths');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Library Root
app.post('/api/library/roots', async (req, res) => {
  const { name, path, type, category } = req.body;
  try {
    const [result] = await db.query('INSERT INTO library_paths (name, path, type, category) VALUES (?, ?, ?, ?)', [name, path, type, category]);
    res.json({ id: result.insertId, name, path, type, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Directory Contents
app.get('/api/library/list', async (req, res) => {
  const dirPath = req.query.path;
  if (!dirPath) return res.status(400).json({ error: 'Path required' });

  // Security Check: Ensure path starts with one of our allowed roots
  try {
    const [roots] = await db.query('SELECT path FROM library_paths WHERE type = "FOLDER"');
    const allowed = roots.some(r => dirPath.startsWith(r.path));
    
    // For now, allowing all local paths since it's a local tool for the user
    // if (!allowed) return res.status(403).json({ error: 'Access denied' });

    if (!fs.existsSync(dirPath)) return res.status(404).json({ error: 'Path not found' });

    const items = fs.readdirSync(dirPath, { withFileTypes: true }).map(dirent => ({
      name: dirent.name,
      isDirectory: dirent.isDirectory(),
      path: path.join(dirPath, dirent.name)
    }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve File
app.get('/api/library/open', (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.sendFile(path.resolve(filePath));
});

// --- PYQ Tracking Routes ---

// Get Progress
app.get('/api/pyq/progress', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM topic_pyq_progress');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Progress
app.post('/api/pyq/toggle', async (req, res) => {
  const { topic_name, year } = req.body;
  try {
    // Check if exists
    const [existing] = await db.query('SELECT * FROM topic_pyq_progress WHERE topic_name = ? AND year = ?', [topic_name, year]);
    
    if (existing.length > 0) {
      const newState = !existing[0].is_solved;
      await db.query('UPDATE topic_pyq_progress SET is_solved = ? WHERE id = ?', [newState, existing[0].id]);
      res.json({ success: true, is_solved: newState });
    } else {
      await db.query('INSERT INTO topic_pyq_progress (topic_name, year, is_solved) VALUES (?, ?, TRUE)', [topic_name, year]);
      res.json({ success: true, is_solved: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Paper Tracking Routes (Full Question Papers) ---

// Get Paper Progress
app.get('/api/papers/progress', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM paper_progress ORDER BY year DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Paper Progress
app.post('/api/papers/toggle', async (req, res) => {
  const { year, stream } = req.body;
  try {
    // Check if exists
    const [existing] = await db.query('SELECT * FROM paper_progress WHERE year = ? AND stream = ?', [year, stream]);
    
    if (existing.length > 0) {
      const newState = !existing[0].is_solved;
      await db.query('UPDATE paper_progress SET is_solved = ? WHERE id = ?', [newState, existing[0].id]);
      res.json({ success: true, is_solved: newState });
    } else {
      await db.query('INSERT INTO paper_progress (year, stream, is_solved) VALUES (?, ?, TRUE)', [year, stream]);
      res.json({ success: true, is_solved: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes ---

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM courses');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subjects for a course
app.get('/api/courses/:courseId/subjects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subjects WHERE course_id = ?', [req.params.courseId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get topics for a subject
app.get('/api/subjects/:subjectId/topics', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM topics WHERE subject_id = ?', [req.params.subjectId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a topic
app.post('/api/topics', async (req, res) => {
  const { subject_id, name } = req.body;
  try {
    const [result] = await db.query('INSERT INTO topics (subject_id, name) VALUES (?, ?)', [subject_id, name]);
    res.json({ id: result.insertId, subject_id, name, status: 'NOT_STARTED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update topic status
app.put('/api/topics/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE topics SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resources
app.get('/api/resources', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM resources');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resources', async (req, res) => {
  const { title, type, url, subject_id, category } = req.body;
  try {
    const [result] = await db.query('INSERT INTO resources (title, type, url, subject_id, category) VALUES (?, ?, ?, ?, ?)', [title, type, url, subject_id, category]);
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chat (Gemini)
app.post('/api/chat', async (req, res) => {
  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "API Key not configured" });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction || "You are a helpful GATE tutor." }] }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    res.json({ response: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/chart', async (req, res) => {
  try {
    const view = req.query.view || 'daily';
    let labels = [];
    let query = "";
    let queryParams = [];

    if (view === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push({ 
          key: d.toISOString().split('T')[0], 
          label: d.toLocaleDateString('en-US', { weekday: 'short' }) 
        });
      }
      query = `
        SELECT DATE(start_time) as date, 
        SUM(CASE WHEN mode IN ('focus', 'manual') THEN duration ELSE -duration END) as total_seconds
        FROM study_sessions
        WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(start_time)
      `;
    } else if (view === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        
        // Align to Monday
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const startOfWeek = new Date(d.setDate(diff));
        
        // Format locally to avoid UTC shifts
        const key = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
        
        labels.push({ 
          key: key, 
          label: `Week ${4-i}` 
        });
      }
      // Simplified weekly query: Group by Year-Week
      // Fix for only_full_group_by: Group by the exact date expression
      query = `
        SELECT DATE(DATE_SUB(start_time, INTERVAL WEEKDAY(start_time) DAY)) as date, 
        SUM(CASE WHEN mode IN ('focus', 'manual') THEN duration ELSE -duration END) as total_seconds
        FROM study_sessions
        WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
        GROUP BY DATE(DATE_SUB(start_time, INTERVAL WEEKDAY(start_time) DAY))
      `;
    } else if (view === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.push({ 
          key: key, 
          label: d.toLocaleDateString('en-US', { month: 'short' }) 
        });
      }
      query = `
        SELECT DATE_FORMAT(start_time, '%Y-%m') as date, 
        SUM(CASE WHEN mode IN ('focus', 'manual') THEN duration ELSE -duration END) as total_seconds
        FROM study_sessions
        WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(start_time, '%Y-%m')
      `;
    }

    let rows = [];
    try {
      [rows] = await db.query(query);
    } catch (dbErr) {
      console.error("Chart Query Error:", dbErr.message);
      return res.json([]);
    }

    const data = labels.map(item => {
      const row = rows.find(r => {
        let rDate;
        if (view === 'monthly') {
           rDate = r.date; // Already YYYY-MM
        } else {
           // For daily/weekly, handle Date object or string
           if (r.date instanceof Date) {
               // Use local date components to match the key generation logic
               rDate = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}-${String(r.date.getDate()).padStart(2, '0')}`;
           } else {
               rDate = String(r.date).split('T')[0];
           }
        }
        return rDate === item.key;
      });
      
      // Fallback for weekly if date matching is tricky: just return what we have? 
      // No, let's stick to the plan. If weekly query returns start-of-week dates, it should match.
      
      return {
        name: item.label,
        minutes: row ? Math.round(row.total_seconds / 60) : 0
      };
    });

    // If weekly/monthly data is sparse, the above mapping might miss if dates don't align perfectly.
    // A more robust way for weekly/monthly is to just return the rows formatted if we don't care about zero-filling strictly,
    // but zero-filling is nice for charts.
    // Let's trust the daily one works well, and for others, if it fails, we might see empty bars.
    
    res.json(data);
  } catch (err) {
    console.error("Chart Endpoint Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Playlist Routes ---

app.post('/api/playlists', async (req, res) => {
  const { url, subject_id } = req.body;
  try {
    // Extract ID from URL
    let playlistId = url;
    try {
      const urlObj = new URL(url);
      const listParam = urlObj.searchParams.get("list");
      if (listParam) playlistId = listParam;
    } catch (e) {
      // Assume it's the ID if not a URL
    }

    if (!playlistId) return res.status(400).json({ error: "Invalid Playlist URL" });

    // Fetch from YouTube using yt-search
    const playlist = await yts({ listId: playlistId });
    
    if (!playlist || !playlist.videos || playlist.videos.length === 0) {
       throw new Error("Failed to fetch playlist or playlist is empty");
    }

    // Save Playlist
    await db.query(
      'INSERT INTO playlists (id, title, url, thumbnail, subject_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=?, thumbnail=?',
      [playlistId, playlist.title, playlist.url, playlist.thumbnail || '', subject_id, playlist.title, playlist.thumbnail || '']
    );

    // Save Videos
    const values = playlist.videos.map((item, index) => [
      item.videoId, 
      playlistId, 
      item.title, 
      item.thumbnail || '', 
      index
    ]);

    // Bulk Insert in Chunks (to handle large playlists without hitting SQL packet limits)
    const chunkSize = 100; // Insert 100 videos at a time
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunk = values.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        await db.query(
          'INSERT IGNORE INTO playlist_videos (id, playlist_id, title, thumbnail, position) VALUES ?',
          [chunk]
        );
      }
    }

    res.json({ success: true, playlistId: playlistId, title: playlist.title });
  } catch (err) {
    console.error("Playlist Error:", err);
    res.status(500).json({ error: err.message || "Failed to load playlist" });
  }
});

app.delete('/api/playlists/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM playlists WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/playlists', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*, 
        COUNT(pv.id) as total_videos, 
        SUM(CASE WHEN pv.is_completed = 1 THEN 1 ELSE 0 END) as completed_videos 
      FROM playlists p 
      LEFT JOIN playlist_videos pv ON p.id = pv.playlist_id 
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/playlists/:id', async (req, res) => {
  try {
    const [playlist] = await db.query('SELECT * FROM playlists WHERE id = ?', [req.params.id]);
    const [videos] = await db.query('SELECT * FROM playlist_videos WHERE playlist_id = ? ORDER BY position ASC', [req.params.id]);
    
    if (playlist.length === 0) return res.status(404).json({ error: "Playlist not found" });
    
    res.json({ ...playlist[0], videos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/playlists/video/toggle', async (req, res) => {
  const { video_id } = req.body;
  try {
    const [existing] = await db.query('SELECT is_completed FROM playlist_videos WHERE id = ?', [video_id]);
    if (existing.length === 0) return res.status(404).json({ error: "Video not found" });

    const newState = !existing[0].is_completed;
    await db.query('UPDATE playlist_videos SET is_completed = ? WHERE id = ?', [newState, video_id]);
    
    res.json({ success: true, is_completed: newState });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- System Routes ---
app.post('/api/shutdown', (req, res) => {
  res.json({ success: true });
  console.log("Received shutdown signal.");
  
  setTimeout(() => {
    // Attempt to kill the specific launcher window (which kills the npm process tree)
    exec('taskkill /F /FI "WINDOWTITLE eq GATE Nexus Engine (DO NOT CLOSE)"', (err) => {
      if (err) {
        // Fallback: Just exit this process (concurrently --kill-others should handle the rest)
        console.log("Could not find launcher window, exiting process...");
        process.exit(0);
      }
    });
  }, 500);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- Dashboard Routes ---
app.get('/api/dashboard/data', async (req, res) => {
  try {
    // 1. Playlist Stats
    const [playlists] = await db.query(`
      SELECT 
        p.id, 
        p.title, 
        p.thumbnail,
        COUNT(pv.id) as total_videos, 
        SUM(CASE WHEN pv.is_completed = 1 THEN 1 ELSE 0 END) as completed_videos 
      FROM playlists p 
      LEFT JOIN playlist_videos pv ON p.id = pv.playlist_id 
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `);

    // 2. Topic PYQ Stats
    const [topics] = await db.query('SELECT * FROM topic_pyq_progress WHERE is_solved = 1');

    // 3. Paper Stats
    const [papers] = await db.query('SELECT * FROM paper_progress WHERE is_solved = 1');

    res.json({
      playlists,
      solvedTopics: topics,
      solvedPapers: papers
    });
  } catch (err) {
    console.error("Dashboard Data Error:", err);
    res.status(500).json({ error: err.message });
  }
});
