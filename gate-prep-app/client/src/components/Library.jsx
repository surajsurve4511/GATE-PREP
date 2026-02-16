import React, { useState, useEffect } from 'react';
import { FolderOpen, FileText, ChevronRight, CheckCircle2, Plus, Folder, File, ArrowLeft, Youtube, ExternalLink, PlayCircle, Trash2 } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const Library = ({ SYLLABUS_CS, SYLLABUS_DA }) => {
  const [activeTab, setActiveTab] = useState('explorer'); // 'explorer', 'tracker', 'playlists'
  
  // Explorer State
  const [roots, setRoots] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);

  // Tracker State
  const [progress, setProgress] = useState({}); // { "TopicName-2024": true }
  const [paperProgress, setPaperProgress] = useState({}); // { "CS-2024": true }
  const years = Array.from({ length: 16 }, (_, i) => 2025 - i);

  // Playlist State
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState(null);

  useEffect(() => {
    fetchRoots();
    fetchProgress();
    fetchPaperProgress();
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists');
      if (res.ok) setPlaylists(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAddPlaylist = async (e) => {
    e.preventDefault();
    setLoadingPlaylist(true);
    setPlaylistError(null);
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newPlaylistUrl, subject_id: 'General' })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNewPlaylistUrl('');
        fetchPlaylists();
      } else {
        setPlaylistError(data.error || "Failed to add playlist. Please check the URL.");
      }
    } catch (err) { 
      console.error(err);
      setPlaylistError("Network error. Please check your connection.");
    }
    setLoadingPlaylist(false);
  };

  const handleSelectPlaylist = async (id) => {
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (res.ok) setSelectedPlaylist(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleDeletePlaylist = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      fetchPlaylists();
      if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
    } catch (err) { console.error(err); }
  };

  const toggleVideo = async (videoId) => {
    try {
      const res = await fetch('/api/playlists/video/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId })
      });
      if (res.ok) {
        // Update local state
        setSelectedPlaylist(prev => ({
          ...prev,
          videos: prev.videos.map(v => v.id === videoId ? { ...v, is_completed: !v.is_completed } : v)
        }));
      }
    } catch (err) { console.error(err); }
  };

  const fetchRoots = async () => {
    try {
      const res = await fetch('/api/library/roots');
      const data = await res.json();
      setRoots(data);
    } catch (err) { console.error(err); }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/pyq/progress');
      const data = await res.json();
      const map = {};
      data.forEach(p => {
        if (p.is_solved) map[`${p.topic_name}-${p.year}`] = true;
      });
      setProgress(map);
    } catch (err) { console.error(err); }
  };

  const fetchPaperProgress = async () => {
    try {
      const res = await fetch('/api/papers/progress');
      const data = await res.json();
      const map = {};
      data.forEach(p => {
        if (p.is_solved) map[`${p.stream}-${p.year}`] = true;
      });
      setPaperProgress(map);
    } catch (err) { console.error(err); }
  };

  const openFolder = async (path) => {
    try {
      const res = await fetch(`/api/library/list?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (res.ok) {
        if (currentPath) setHistory(prev => [...prev, currentPath]);
        setCurrentPath(path);
        setFiles(data);
      }
    } catch (err) { console.error(err); }
  };

  const goBack = () => {
    if (history.length === 0) {
      setCurrentPath(null);
      setFiles([]);
    } else {
      const prev = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      openFolder(prev);
    }
  };

  const openFile = (path) => {
    window.open(`/api/library/open?path=${encodeURIComponent(path)}`, '_blank');
  };

  const toggleProgress = async (topic, year) => {
    try {
      const res = await fetch('/api/pyq/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_name: topic, year })
      });
      const data = await res.json();
      if (data.success) {
        setProgress(prev => ({
          ...prev,
          [`${topic}-${year}`]: data.is_solved
        }));
      }
    } catch (err) { console.error(err); }
  };

  const togglePaperProgress = async (stream, year) => {
    try {
      const res = await fetch('/api/papers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream, year })
      });
      const data = await res.json();
      if (data.success) {
        setPaperProgress(prev => ({
          ...prev,
          [`${stream}-${year}`]: data.is_solved
        }));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Library & PYQ Tracker</h1>
          <p className="text-slate-400">Manage local resources and track topic-wise progress.</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'explorer' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Resource Explorer
          </button>
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'tracker' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            PYQ Tracker
          </button>
          <button 
            onClick={() => setActiveTab('papers')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'papers' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Full Papers
          </button>
          <button 
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'playlists' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Video Courses
          </button>
        </div>
      </header>

      {activeTab === 'playlists' && (
        <div className="space-y-6 animate-in fade-in">
          {!selectedPlaylist ? (
            <>
              <Card>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus size={20} className="text-emerald-400" /> Add New Playlist
                </h3>
                <form onSubmit={handleAddPlaylist} className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Paste YouTube Playlist URL..." 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
                    value={newPlaylistUrl}
                    onChange={(e) => setNewPlaylistUrl(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={loadingPlaylist}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loadingPlaylist ? 'Loading...' : 'Add Course'}
                  </button>
                </form>
                {playlistError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    <strong>Error:</strong> {playlistError}
                  </div>
                )}
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map(playlist => (
                  <div 
                    key={playlist.id}
                    onClick={() => handleSelectPlaylist(playlist.id)}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all cursor-pointer group"
                  >
                    <div className="aspect-video bg-slate-950 relative">
                      <img src={playlist.thumbnail} alt={playlist.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <PlayCircle size={48} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white line-clamp-2 flex-1 mr-2">{playlist.title}</h4>
                        <button 
                          onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="Delete Playlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{new Date(playlist.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Youtube size={12} /> Playlist</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedPlaylist(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> Back to Courses
              </button>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 space-y-6">
                  <Card>
                    <img src={selectedPlaylist.thumbnail} alt={selectedPlaylist.title} className="w-full rounded-lg mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">{selectedPlaylist.title}</h2>
                    <a 
                      href={selectedPlaylist.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Open in YouTube <ExternalLink size={14} />
                    </a>
                  </Card>
                </div>

                <div className="md:w-2/3">
                  <Card className="h-[600px] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">Course Content</h3>
                    <div className="space-y-2">
                      {selectedPlaylist.videos.map((video, idx) => (
                        <div 
                          key={video.id} 
                          className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                            video.is_completed 
                              ? 'bg-emerald-900/10 border-emerald-900/30' 
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <button 
                            onClick={() => toggleVideo(video.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                              video.is_completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-600 text-transparent hover:border-emerald-500'
                            }`}
                          >
                            <CheckCircle2 size={14} fill="currentColor" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium truncate ${video.is_completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                              {idx + 1}. {video.title}
                            </h4>
                          </div>
                          <a 
                            href={`https://www.youtube.com/watch?v=${video.id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-slate-500 hover:text-white"
                          >
                            <PlayCircle size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'explorer' && (
        <Card className="min-h-[500px]">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
            {currentPath ? (
              <button onClick={goBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            ) : (
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                <FolderOpen size={20} />
              </div>
            )}
            <div className="flex-1 font-mono text-sm text-slate-300 truncate">
              {currentPath || 'Root Library'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!currentPath && roots.map(root => (
              <div 
                key={root.id}
                onClick={() => root.type === 'FOLDER' ? openFolder(root.path) : openFile(root.path)}
                className="group p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-4"
              >
                <div className={`p-3 rounded-lg ${root.type === 'FOLDER' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                  {root.type === 'FOLDER' ? <Folder size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <h3 className="font-medium text-slate-200 group-hover:text-white">{root.name}</h3>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{root.category}</span>
                </div>
              </div>
            ))}

            {currentPath && files.map((file, idx) => (
              <div 
                key={idx}
                onClick={() => file.isDirectory ? openFolder(file.path) : openFile(file.path)}
                className="group p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-600 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-3"
              >
                {file.isDirectory ? (
                  <Folder size={20} className="text-blue-400" />
                ) : (
                  <File size={20} className="text-slate-400 group-hover:text-slate-200" />
                )}
                <span className="text-sm text-slate-300 truncate flex-1">{file.name}</span>
              </div>
            ))}
            
            {currentPath && files.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                Empty Directory
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'tracker' && (
        <div className="space-y-8">
          {/* CS Tracker */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 /> CS Stream Progress
            </h2>
            {SYLLABUS_CS.map(subject => (
              <div key={subject.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 font-semibold text-slate-200">
                  {subject.title}
                </div>
                <div className="divide-y divide-slate-800">
                  {subject.topics.map((topic, tIdx) => (
                    <div key={tIdx} className="p-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-1/3 text-sm text-slate-300 font-medium">{topic}</div>
                        <div className="flex-1 flex flex-wrap gap-1">
                          {years.map(year => {
                            const isDone = progress[`${topic}-${year}`];
                            return (
                              <button
                                key={year}
                                onClick={() => toggleProgress(topic, year)}
                                className={`text-[10px] px-2 py-1 rounded border transition-all ${
                                  isDone 
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                }`}
                                title={`${topic} - ${year}`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* DA Tracker */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-violet-400 flex items-center gap-2">
              <CheckCircle2 /> DA Stream Progress
            </h2>
            {SYLLABUS_DA.map(subject => (
              <div key={subject.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 font-semibold text-slate-200">
                  {subject.title}
                </div>
                <div className="divide-y divide-slate-800">
                  {subject.topics.map((topic, tIdx) => (
                    <div key={tIdx} className="p-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-1/3 text-sm text-slate-300 font-medium">{topic}</div>
                        <div className="flex-1 flex flex-wrap gap-1">
                          {years.map(year => {
                            const isDone = progress[`${topic}-${year}`];
                            return (
                              <button
                                key={year}
                                onClick={() => toggleProgress(topic, year)}
                                className={`text-[10px] px-2 py-1 rounded border transition-all ${
                                  isDone 
                                    ? 'bg-violet-500/20 border-violet-500 text-violet-400' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                }`}
                                title={`${topic} - ${year}`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'papers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CS Papers */}
          <Card>
            <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2 mb-6">
              <FileText /> CS Full Papers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {years.map(year => {
                const isDone = paperProgress[`CS-${year}`];
                return (
                  <button
                    key={year}
                    onClick={() => togglePaperProgress('CS', year)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isDone 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-lg font-bold">{year}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-1">
                      {isDone ? 'Solved' : 'Pending'}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* DA Papers */}
          <Card>
            <h2 className="text-xl font-bold text-violet-400 flex items-center gap-2 mb-6">
              <FileText /> DA Full Papers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {years.map(year => {
                const isDone = paperProgress[`DA-${year}`];
                return (
                  <button
                    key={year}
                    onClick={() => togglePaperProgress('DA', year)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isDone 
                        ? 'bg-violet-500/20 border-violet-500 text-violet-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-lg font-bold">{year}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-1">
                      {isDone ? 'Solved' : 'Pending'}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Library;
