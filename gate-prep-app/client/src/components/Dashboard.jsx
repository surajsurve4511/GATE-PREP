import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Cpu, 
  BrainCircuit, 
  Clock, 
  Zap,
  Target,
  FileText,
  Plus,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';

const ProgressBar = ({ value, max, color = "bg-blue-500" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-slate-800 rounded-full h-2.5 mb-1 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ease-out ${color}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const Dashboard = ({ csProgress, daProgress, todos, setTodos, setActiveTab }) => {
  const [paperStats, setPaperStats] = useState({ cs: 0, da: 0 });
  const [playlistStats, setPlaylistStats] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard/data');
        const data = await res.json();
        
        // Process Paper Stats
        let cs = 0, da = 0;
        data.solvedPapers.forEach(p => {
          if (p.is_solved) {
            if (p.stream === 'CS') cs++;
            if (p.stream === 'DA') da++;
          }
        });
        setPaperStats({ cs, da });

        // Process Playlist Stats
        setPlaylistStats(data.playlists);

      } catch (err) { console.error(err); }
    };
    fetchDashboardData();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo })
      });
      const data = await res.json();
      setTodos([data, ...todos]);
      setNewTodo("");
    } catch (err) { console.error(err); }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_done: !todo.is_done })
      });
      setTodos(todos.map(t => t.id === id ? { ...t, is_done: !t.is_done } : t));
    } catch (err) { console.error(err); }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
        <p className="text-slate-400">GATE 2026 Preparation Overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Computer Science</h3>
            <Cpu className="text-emerald-500 w-6 h-6" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">{csProgress}%</div>
          <ProgressBar value={csProgress} max={100} color="bg-emerald-500" />
          <p className="text-xs text-slate-400 mt-2">Syllabus Completion</p>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Data Science & AI</h3>
            <BrainCircuit className="text-violet-500 w-6 h-6" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">{daProgress}%</div>
          <ProgressBar value={daProgress} max={100} color="bg-violet-500" />
          <p className="text-xs text-slate-400 mt-2">Syllabus Completion</p>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Days Remaining</h3>
            <Clock className="text-orange-500 w-6 h-6" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {Math.ceil((new Date('2026-02-01') - new Date()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-xs text-slate-400">Target: Feb 2026</div>
        </Card>
      </div>

      {/* Course Progress */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> Active Courses Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlistStats.length === 0 ? (
             <div className="col-span-full text-center py-8 text-slate-500">
               No courses added yet. Go to Library to add one.
             </div>
          ) : (
            playlistStats.map(playlist => (
              <div key={playlist.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <img src={playlist.thumbnail} alt="" className="w-12 h-8 object-cover rounded bg-slate-900" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-200 text-sm truncate" title={playlist.title}>{playlist.title}</h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {Math.round((playlist.completed_videos / (playlist.total_videos || 1)) * 100)}% Completed
                    </div>
                  </div>
                </div>
                <ProgressBar 
                  value={playlist.completed_videos} 
                  max={playlist.total_videos || 1} 
                  color="bg-amber-500" 
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>0</span>
                  <span>{playlist.completed_videos} / {playlist.total_videos} Lectures</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Full Papers Stats & To-Do List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-slate-900/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Full Papers Solved
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-2xl font-bold text-emerald-400">{paperStats.cs} <span className="text-sm text-slate-500">/ 16</span></div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">CS Stream</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <div className="text-2xl font-bold text-violet-400">{paperStats.da} <span className="text-sm text-slate-500">/ 16</span></div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">DA Stream</div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('syllabus-cs')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group">
                <div className="font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">Review CS Topics</div>
                <div className="text-xs text-slate-400">Continue tracking</div>
              </button>
              <button onClick={() => setActiveTab('library')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group">
                <div className="font-medium text-amber-400 group-hover:translate-x-1 transition-transform">Open Library</div>
                <div className="text-xs text-slate-400">Track Books & PYQs</div>
              </button>
              <button onClick={() => setActiveTab('library')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group">
                <div className="font-medium text-blue-400 group-hover:translate-x-1 transition-transform">Full Papers</div>
                <div className="text-xs text-slate-400">Solve 2010-2025 Papers</div>
              </button>
              <button onClick={() => setActiveTab('tools')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group">
                <div className="font-medium text-pink-400 group-hover:translate-x-1 transition-transform">Focus Timer</div>
                <div className="text-xs text-slate-400">Start a session</div>
              </button>
            </div>
          </Card>
        </div>

        {/* Daily To-Do List */}
        <Card className="flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" /> Daily Goals
          </h3>
          
          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-[300px]">
            {todos.length === 0 && (
              <div className="text-center text-slate-500 py-8 text-sm">
                No tasks for today. Add one to get started!
              </div>
            )}
            {todos.map(todo => (
              <div 
                key={todo.id} 
                className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  todo.is_done 
                    ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 transition-colors ${todo.is_done ? 'text-emerald-500' : 'text-slate-400 hover:text-white'}`}
                >
                  {todo.is_done ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <span className={`flex-1 text-sm ${todo.is_done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {todo.text}
                </span>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
