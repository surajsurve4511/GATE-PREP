import React, { useState, useEffect } from 'react';
import { Pause, Play, RotateCcw, Square, FileText, History, Calendar, Clock, BarChart2, Plus, Maximize2, Minimize2, Settings, Tag, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const Tools = ({ 
  timerActive, setTimerActive, timeLeft, timerMode, resetTimer, stopTimer, switchTimerMode,
  notes, setNotes, formatTime, 
  sessionLabel, setSessionLabel, customDurations, setCustomDurations, lastUpdated 
}) => {
  const [analysis, setAnalysis] = useState({ daily: 0, weekly: 0, monthly: 0, total: 0 });
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartView, setChartView] = useState('daily');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualSession, setManualSession] = useState({ duration: 30, notes: '', date: new Date().toISOString().split('T')[0] });
  const [focusMode, setFocusMode] = useState(false); // UI Focus Mode (hides distractions)
  const [showSettings, setShowSettings] = useState(false); // Toggle for custom durations

  useEffect(() => {
    fetchAnalysis();
    fetchHistory();
    fetchChartData();
  }, [timerActive, chartView, lastUpdated]); // Refresh when timer state changes or view changes

  const fetchAnalysis = async () => {
    try {
      const res = await fetch('/api/sessions/analysis');
      if (!res.ok) throw new Error('Failed to fetch analysis');
      const data = await res.json();
      setAnalysis(data);
    } catch (err) { 
      console.error("Analysis fetch error:", err); 
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/sessions/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("History fetch error:", err);
      setHistory([]);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await fetch(`/api/sessions/chart?view=${chartView}`);
      if (!res.ok) throw new Error('Failed to fetch chart data');
      const data = await res.json();
      setChartData(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Chart fetch error:", err);
      setChartData([]);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          duration: manualSession.duration * 60, // Convert to seconds
          mode: 'manual', 
          notes: manualSession.notes,
          date: manualSession.date // Backend needs to handle this if provided
        })
      });
      setShowManualEntry(false);
      fetchAnalysis();
      fetchHistory();
      fetchChartData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      fetchAnalysis();
      fetchHistory();
      fetchChartData();
    } catch (err) { console.error(err); }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Focus Mode Toggle Header */}
      <div className="flex justify-end">
        <button 
          onClick={() => setFocusMode(!focusMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            focusMode 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          {focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-1 max-w-2xl mx-auto' : 'lg:grid-cols-2'} gap-8 transition-all duration-500`}>
        {/* Pomodoro */}
        <Card className="flex flex-col items-center justify-center py-12 text-center relative">
          <div className="absolute top-4 left-4">
             <button onClick={() => setShowSettings(!showSettings)} className="text-slate-500 hover:text-white transition-colors" title="Timer Settings">
               <Settings size={20} />
             </button>
          </div>
          <div className="absolute top-4 right-4 flex flex-col items-end">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Focus</div>
            <div className="text-xl font-bold text-emerald-400 flex items-center gap-1">
              <History size={16} /> {formatDuration(analysis.total)}
            </div>
          </div>

          {/* Session Label Input */}
          <div className="mb-6 w-full max-w-xs relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
               <Tag size={14} />
             </div>
             <input 
               type="text" 
               placeholder="What are you focusing on?" 
               className="w-full bg-slate-950 border border-slate-800 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors text-center"
               value={sessionLabel}
               onChange={(e) => setSessionLabel(e.target.value)}
               disabled={timerActive}
             />
          </div>

          <div className="mb-8 relative">
          <div className="w-64 h-64 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
             <div className={`absolute inset-0 rounded-full border-8 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent rotate-45 transition-all duration-1000 ${timerActive ? 'animate-spin-slow' : ''}`}></div>
             <div className="text-6xl font-mono font-bold text-white tracking-wider">
               {formatTime(timeLeft)}
             </div>
          </div>
        </div>
        
        {/* Timer Controls & Settings */}
        {showSettings ? (
           <div className="mb-8 bg-slate-950 p-4 rounded-lg border border-slate-800 animate-in fade-in w-full max-w-sm">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Custom Durations (Minutes)</h4>
              <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="text-[10px] text-emerald-400 block mb-1">Focus</label>
                    <input type="number" min="1" value={customDurations.focus} onChange={(e) => setCustomDurations({...customDurations, focus: parseInt(e.target.value) || 1})} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center text-sm text-white" />
                 </div>
                 <div>
                    <label className="text-[10px] text-blue-400 block mb-1">Short</label>
                    <input type="number" min="1" value={customDurations.short} onChange={(e) => setCustomDurations({...customDurations, short: parseInt(e.target.value) || 1})} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center text-sm text-white" />
                 </div>
                 <div>
                    <label className="text-[10px] text-purple-400 block mb-1">Long</label>
                    <input type="number" min="1" value={customDurations.long} onChange={(e) => setCustomDurations({...customDurations, long: parseInt(e.target.value) || 1})} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center text-sm text-white" />
                 </div>
              </div>
              <button onClick={() => { setShowSettings(false); resetTimer(timerMode); }} className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded transition-colors">Save & Reset Timer</button>
           </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button onClick={() => switchTimerMode('focus')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timerMode === 'focus' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}>Focus ({customDurations.focus}m)</button>
            <button onClick={() => switchTimerMode('short')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timerMode === 'short' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-white'}`}>Short ({customDurations.short}m)</button>
            <button onClick={() => switchTimerMode('long')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timerMode === 'long' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-white'}`}>Long ({customDurations.long}m)</button>
            <button onClick={() => switchTimerMode('stopwatch')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timerMode === 'stopwatch' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white'}`}>Stopwatch</button>
          </div>
        )}

        <div className="flex gap-4">
          <button 
            onClick={() => setTimerActive(!timerActive)}
            className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
          >
            {timerActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={stopTimer}
            className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/30 transition-colors border border-red-500/50"
            title="Stop & Save"
          >
            <Square size={24} fill="currentColor" />
          </button>
          <button 
            onClick={() => resetTimer(timerMode)}
            className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
            title="Reset"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </Card>

      {/* Quick Notes - Hide in Focus Mode if desired, or keep it. Let's keep it but stack it differently */}
      <div className={`flex flex-col h-full ${focusMode ? 'hidden' : ''}`}>
         <div className="bg-slate-900 border border-slate-800 rounded-t-xl p-4 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText size={18} /> Scratchpad
            </h3>
            <span className="text-xs text-slate-500">Auto-saving enabled</span>
         </div>
         <textarea 
           className="flex-1 w-full bg-slate-950 border-x border-b border-slate-800 p-6 text-slate-300 font-mono focus:outline-none resize-none rounded-b-xl"
           placeholder="// Type your quick formulas, concepts or thoughts here..."
           value={notes}
           onChange={(e) => setNotes(e.target.value)}
         />
      </div>
      </div>

      {/* Analysis Section - Hide in Focus Mode */}
      {!focusMode && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={20} /></div>
            <span className="text-slate-400 text-sm font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatDuration(analysis.daily)}</div>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400"><Calendar size={20} /></div>
            <span className="text-slate-400 text-sm font-medium">This Week</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatDuration(analysis.weekly)}</div>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><History size={20} /></div>
            <span className="text-slate-400 text-sm font-medium">This Month</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatDuration(analysis.monthly)}</div>
        </Card>
      </div>

      {/* Study Trend Chart */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart2 className="text-slate-400" size={20} /> Study Trend
          </h3>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            {['daily', 'weekly', 'monthly'].map((view) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  chartView === view 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Array.isArray(chartData) ? chartData : []}>
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${Math.abs(value)}m`} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                cursor={{ fill: '#1e293b' }}
                formatter={(value) => [
                  `${Math.abs(value)} mins`, 
                  value >= 0 ? 'Focus Time' : 'Break Time'
                ]}
              />
              <ReferenceLine y={0} stroke="#334155" />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.minutes >= 0 ? '#10b981' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent History */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="text-slate-400" size={20} /> Recent Sessions
          </h3>
          <button 
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> Add Session
          </button>
        </div>

        {showManualEntry && (
          <div className="mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800 animate-in slide-in-from-top-2">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={manualSession.date}
                    onChange={e => setManualSession({...manualSession, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={manualSession.duration}
                    onChange={e => setManualSession({...manualSession, duration: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Notes</label>
                <input 
                  type="text" 
                  placeholder="What did you study?"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={manualSession.notes}
                  onChange={e => setManualSession({...manualSession, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowManualEntry(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs uppercase bg-slate-950 text-slate-500">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Date</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 rounded-r-lg w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-600">No sessions recorded yet.</td>
                </tr>
              )}
              {history.map((session) => (
                <tr key={session.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {new Date(session.start_time).toLocaleDateString()} <span className="text-slate-600">|</span> {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      session.mode === 'focus' ? 'bg-emerald-500/10 text-emerald-400' : 
                      session.mode === 'short' ? 'bg-blue-500/10 text-blue-400' : 
                      session.mode === 'manual' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {session.mode.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{formatDuration(session.duration)}</td>
                  <td className="px-4 py-3 truncate max-w-[200px]">{session.notes}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </>
      )}
    </div>
  );
};

export default Tools;
