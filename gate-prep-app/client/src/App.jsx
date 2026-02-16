import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Terminal, 
  BrainCircuit, 
  Cpu, 
  Library as LibraryIcon,
  Power,
  Menu,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Syllabus from './components/Syllabus';
import Library from './components/Library';
import Tools from './components/Tools';
import AIModal from './components/AIModal';

// Simple Toast Component
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 z-50 ${
    type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
  }`}>
    {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
    <span className="font-medium text-sm">{message}</span>
    <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100"><X size={14} /></button>
  </div>
);

// --- Data: Syllabus Definitions with Weightage ---
// (Ideally fetched from DB, but hardcoded here to match example.jsx structure for now)
const SYLLABUS_CS = [
  {
    id: 1,
    title: "Engineering Mathematics",
    weightage: "13-15 Marks",
    topics: [
      "Discrete Mathematics: Propositional and first order logic",
      "Sets, relations, functions, partial orders and lattices",
      "Monoids, Groups",
      "Graphs: connectivity, matching, colouring",
      "Combinatorics: counting, recurrence relations, generating functions",
      "Linear Algebra: Matrices, determinants, system of linear equations",
      "Eigenvalues and eigenvectors, LU decomposition",
      "Calculus: Limits, continuity and differentiability",
      "Maxima and minima, Mean value theorem, Integration",
      "Probability: Random variables, Uniform, normal, exponential, Poisson, binomial",
      "Mean, median, mode, standard deviation",
      "Conditional probability and Bayes theorem"
    ]
  },
  {
    id: 2,
    title: "Digital Logic",
    weightage: "5-6 Marks",
    topics: [
      "Boolean algebra",
      "Combinational and sequential circuits",
      "Minimization",
      "Number representations and computer arithmetic (fixed and floating point)"
    ]
  },
  {
    id: 3,
    title: "Computer Organization & Architecture",
    weightage: "8-9 Marks",
    topics: [
      "Machine instructions and addressing modes",
      "ALU, data-path and control unit",
      "Instruction pipelining, pipeline hazards",
      "Memory hierarchy: cache, main memory and secondary storage",
      "I/O interface (interrupt and DMA mode)"
    ]
  },
  {
    id: 4,
    title: "Programming and Data Structures",
    weightage: "10-12 Marks",
    topics: [
      "Programming in C",
      "Recursion",
      "Arrays, stacks, queues",
      "Linked lists",
      "Trees, binary search trees, binary heaps",
      "Graphs"
    ]
  },
  {
    id: 5,
    title: "Algorithms",
    weightage: "6-8 Marks",
    topics: [
      "Searching, sorting, hashing",
      "Asymptotic worst case time and space complexity",
      "Greedy algorithms",
      "Dynamic programming",
      "Divide-and-conquer",
      "Graph traversals",
      "Minimum spanning trees",
      "Shortest paths"
    ]
  },
  {
    id: 6,
    title: "Theory of Computation",
    weightage: "7-8 Marks",
    topics: [
      "Regular expressions and finite automata",
      "Context-free grammars and push-down automata",
      "Regular and context-free languages, pumping lemma",
      "Turing machines and undecidability"
    ]
  },
  {
    id: 7,
    title: "Compiler Design",
    weightage: "3-4 Marks",
    topics: [
      "Lexical analysis, parsing, syntax-directed translation",
      "Runtime environments",
      "Intermediate code generation",
      "Local optimization",
      "Data flow analyses: constant propagation, liveness analysis"
    ]
  },
  {
    id: 8,
    title: "Operating System",
    weightage: "8-10 Marks",
    topics: [
      "System calls, processes, threads",
      "Inter-process communication, concurrency and synchronization",
      "Deadlock",
      "CPU and I/O scheduling",
      "Memory management and virtual memory",
      "File systems"
    ]
  },
  {
    id: 9,
    title: "Databases",
    weightage: "7-8 Marks",
    topics: [
      "ER-model",
      "Relational model: relational algebra, tuple calculus, SQL",
      "Integrity constraints, normal forms",
      "File organization, indexing (e.g., B and B+ trees)",
      "Transactions and concurrency control"
    ]
  },
  {
    id: 10,
    title: "Computer Networks",
    weightage: "7-8 Marks",
    topics: [
      "Concept of layering: OSI and TCP/IP Protocol Stacks",
      "Data link layer: framing, error detection, MAC, Ethernet bridging",
      "Routing protocols: shortest path, flooding, distance vector, link state",
      "Fragmentation and IP addressing, IPv4, CIDR",
      "Basics of IP support protocols (ARP, DHCP, ICMP), NAT",
      "Transport layer: flow control, congestion control, UDP, TCP, sockets",
      "Application layer: DNS, SMTP, HTTP, FTP, Email"
    ]
  }
];

const SYLLABUS_DA = [
  {
    id: "DA1",
    title: "Probability and Statistics",
    weightage: "14-16 Marks",
    topics: [
      "Counting (permutation and combinations)",
      "Probability axioms, Sample space, events",
      "Independent/mutually exclusive events",
      "Marginal, conditional and joint probability, Bayes Theorem",
      "Conditional expectation and variance",
      "Mean, median, mode, standard deviation, correlation, covariance",
      "Random variables (Discrete & Continuous), PMF, PDF, CDF",
      "Distributions: Uniform, Bernoulli, binomial, exponential, Poisson, normal, t-dist, chi-squared",
      "Central limit theorem, confidence interval",
      "z-test, t-test, chi-squared test"
    ]
  },
  {
    id: "DA2",
    title: "Linear Algebra",
    weightage: "8-10 Marks",
    topics: [
      "Vector space, subspaces, linear dependence/independence",
      "Matrices: projection, orthogonal, idempotent, partition",
      "Quadratic forms",
      "Systems of linear equations and solutions, Gaussian elimination",
      "Eigenvalues and eigenvectors, determinant, rank, nullity",
      "Projections, LU decomposition, Singular value decomposition (SVD)"
    ]
  },
  {
    id: "DA3",
    title: "Calculus and Optimization",
    weightage: "8-12 Marks",
    topics: [
      "Functions of a single variable, limit, continuity, differentiability",
      "Taylor series, maxima and minima",
      "Optimization involving a single variable"
    ]
  },
  {
    id: "DA4",
    title: "Programming, DS and Algorithms",
    weightage: "12-14 Marks",
    topics: [
      "Programming in Python",
      "Basic data structures: stacks, queues, linked lists, trees, hash tables",
      "Search algorithms: linear search and binary search",
      "Basic sorting: selection, bubble, insertion",
      "Divide and conquer: mergesort, quicksort",
      "Introduction to graph theory",
      "Basic graph algorithms: traversals and shortest path"
    ]
  },
  {
    id: "DA5",
    title: "Database Management & Warehousing",
    weightage: "8-10 Marks",
    topics: [
      "ER-model, relational model: relational algebra, tuple calculus, SQL",
      "Integrity constraints, normal form",
      "File organization, indexing",
      "Data types, transformation (normalization, discretization, sampling, compression)",
      "Data warehouse modelling: schema for multidimensional data, concept hierarchies"
    ]
  },
  {
    id: "DA6",
    title: "Machine Learning",
    weightage: "11-12 Marks",
    topics: [
      "Supervised Learning: regression (simple/multiple linear, ridge) and classification",
      "Logistic regression, k-nearest neighbour, naive Bayes",
      "Linear discriminant analysis, SVM, decision trees",
      "Bias-variance trade-off, cross-validation (LOO, k-folds)",
      "Multi-layer perceptron, feed-forward neural network",
      "Unsupervised Learning: k-means/k-medoid, hierarchical clustering",
      "Dimensionality reduction, PCA"
    ]
  },
  {
    id: "DA7",
    title: "Artificial Intelligence",
    weightage: "6-11 Marks",
    topics: [
      "Search: informed, uninformed, adversarial",
      "Logic: propositional, predicate",
      "Reasoning under uncertainty: conditional independence representation",
      "Exact inference through variable elimination",
      "Approximate inference through sampling"
    ]
  }
];

// --- API Integration ---
const callGemini = async (prompt, systemInstruction = "") => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.response || "No response from AI.";
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkedTopics, setCheckedTopics] = useState({});
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [library, setLibrary] = useState({
    pyqs: {}, // { "2020": true }
    topicPyqs: {}, // { "Linear Algebra": true }
    books: [] // [{ id, title, totalCh, readCh }]
  });


  // AI State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState({ title: '', body: '' });

  // Timer Customization State
  const [sessionLabel, setSessionLabel] = useState('');
  const [customDurations, setCustomDurations] = useState({ focus: 25, short: 5, long: 15 });

  // Independent Timer States
  const [timers, setTimers] = useState({
    focus: { timeLeft: 25 * 60, isActive: false },
    short: { timeLeft: 5 * 60, isActive: false },
    long: { timeLeft: 15 * 60, isActive: false },
    stopwatch: { timeLeft: 0, isActive: false }
  });
  const [visibleMode, setVisibleMode] = useState('focus');

  // Toast State
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Persistence & Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Todos
        const todoRes = await fetch('/api/todos');
        if (todoRes.ok) setTodos(await todoRes.json());

        // Fetch Syllabus Progress
        const progressRes = await fetch('/api/syllabus/progress');
        if (progressRes.ok) setCheckedTopics(await progressRes.json());

        // Local Storage for Notes (keep local for now or move to DB later)
        const savedNotes = localStorage.getItem('gate_notes');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('gate_notes', JSON.stringify(notes));
  }, [notes]);

  // Data Refresh Trigger
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Timer Logic
  useEffect(() => {
    let interval = null;
    const activeTimer = timers[visibleMode];

    if (activeTimer.isActive) {
      if (visibleMode === 'stopwatch') {
        // Stopwatch Mode: Count Up
        interval = setInterval(() => {
          setTimers(prev => ({
            ...prev,
            [visibleMode]: { ...prev[visibleMode], timeLeft: prev[visibleMode].timeLeft + 1 }
          }));
        }, 1000);
      } else if (activeTimer.timeLeft > 0) {
        // Countdown Mode: Count Down
        interval = setInterval(() => {
          setTimers(prev => ({
            ...prev,
            [visibleMode]: { ...prev[visibleMode], timeLeft: prev[visibleMode].timeLeft - 1 }
          }));
        }, 1000);
      } else if (activeTimer.timeLeft === 0) {
        // Countdown Finished
        setTimers(prev => ({
          ...prev,
          [visibleMode]: { ...prev[visibleMode], isActive: false }
        }));
        // Log Session
        const duration = customDurations[visibleMode] * 60;
        saveSession(duration, visibleMode, sessionLabel, "Timer Completed");
      }
    }
    return () => clearInterval(interval);
  }, [timers, visibleMode, customDurations, sessionLabel]);

  const saveSession = (duration, mode, label, notes) => {
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        duration, 
        mode: mode === 'stopwatch' ? 'focus' : mode, 
        notes: notes,
        session_label: label 
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save session');
      showToast("Session saved successfully!");
      setLastUpdated(Date.now()); // Trigger refresh
    })
    .catch(err => {
      console.error(err);
      showToast("Failed to save session", "error");
    });
  };

  const toggleTopic = async (topicId) => {
    // Optimistic Update
    setCheckedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));

    try {
      await fetch('/api/syllabus/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicId })
      });
    } catch (err) { console.error(err); }
  };

  const calculateProgress = (syllabus) => {
    let total = 0;
    let completed = 0;
    syllabus.forEach(section => {
      section.topics.forEach(topic => {
        total++;
        if (checkedTopics[`${section.id}-${topic}`]) completed++;
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const csProgress = useMemo(() => calculateProgress(SYLLABUS_CS), [checkedTopics]);
  const daProgress = useMemo(() => calculateProgress(SYLLABUS_DA), [checkedTopics]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetTimer = (mode) => {
    setTimers(prev => ({
      ...prev,
      [mode]: { 
        isActive: false, 
        timeLeft: mode === 'stopwatch' ? 0 : customDurations[mode] * 60 
      }
    }));
    // If we are resetting the currently visible mode, ensure it updates
    if (mode === visibleMode) {
      // No extra action needed as state update triggers re-render
    }
  };

  const stopTimer = () => {
    const { timeLeft, isActive } = timers[visibleMode];
    
    setTimers(prev => ({
      ...prev,
      [visibleMode]: { ...prev[visibleMode], isActive: false }
    }));

    let duration = 0;

    if (visibleMode === 'stopwatch') {
      duration = timeLeft;
    } else {
      const totalTime = customDurations[visibleMode] * 60;
      if (!isActive && timeLeft === totalTime) return; // Already reset
      duration = totalTime - timeLeft;
    }
    
    if (duration > 60) { // Only log if > 1 minute
      saveSession(duration, visibleMode, sessionLabel, visibleMode === 'stopwatch' ? "Stopwatch Session" : "Session Stopped");
    } else {
      showToast("Session too short to save", "error");
    }
    
    // Reset
    resetTimer(visibleMode);
  };

  const switchTimerMode = (newMode) => {
    // Pause the current timer if it's running
    if (timers[visibleMode].isActive) {
      setTimers(prev => ({
        ...prev,
        [visibleMode]: { ...prev[visibleMode], isActive: false }
      }));
    }
    
    // Switch visibility
    setVisibleMode(newMode);
    
    // Initialize the new mode if it hasn't been set up (though initial state handles this)
    // or if we want to ensure it respects current customDurations if it was at 0?
    // For now, we rely on the state being persistent.
  };

  // AI Helper Functions
  const handleExplainTopic = async (topic) => {
    setAiModalOpen(true);
    setAiLoading(true);
    setAiContent({ title: `Explaining: ${topic}`, body: '' });

    try {
      const prompt = `Explain the concept '${topic}' for a GATE exam aspirant. 
      Structure the response as:
      1. Definition (Concise)
      2. Key Concept/Formula
      3. A simple illustrative example or application.
      Keep it under 200 words. Use simple formatting.`;

      const response = await callGemini(prompt, "You are an expert GATE tutor.");
      setAiContent({ title: topic, body: response });
    } catch (error) {
      setAiContent({ title: 'Error', body: 'Failed to fetch explanation. Please try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleShutdown = async () => {
    if (confirm("Are you sure you want to close the application?")) {
      try {
        // Send shutdown signal to server
        await fetch('/api/shutdown', { method: 'POST' });
        
        // Show goodbye message
        document.body.innerHTML = `
          <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #020617; color: #94a3b8; font-family: sans-serif;">
            <h1 style="color: #e2e8f0; margin-bottom: 1rem;">Application Closed</h1>
            <p>You can safely close this window.</p>
          </div>
        `;
        
        // Attempt to close window (works if opened via script/launcher)
        window.close();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const NavItem = ({ id, icon: Icon, label, color }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === id 
          ? 'bg-slate-800 text-white shadow-md translate-x-1' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <Icon size={20} className={activeTab === id ? color : ''} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans">
      <AIModal 
        aiModalOpen={aiModalOpen} 
        setAiModalOpen={setAiModalOpen} 
        aiLoading={aiLoading} 
        aiContent={aiContent} 
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 hidden md:flex flex-col p-4 fixed h-full z-10">
        <div className="flex items-center gap-2 px-4 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
            <Terminal size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">GATE Nexus</h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">AI Prep Suite</span>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem id="dashboard" icon={BarChart3} label="Dashboard" color="text-blue-400" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Syllabus</div>
          <NavItem id="syllabus-cs" icon={Cpu} label="CS Stream" color="text-emerald-400" />
          <NavItem id="syllabus-da" icon={BrainCircuit} label="DA Stream" color="text-violet-400" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Resources</div>
          <NavItem id="library" icon={LibraryIcon} label="Library & PYQs" color="text-amber-400" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Tools</div>
          <NavItem id="tools" icon={Clock} label="Timer" color="text-pink-400" />
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
              U
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">Aspirant</div>
              <div className="text-xs text-slate-500">Keep grinding!</div>
            </div>
          </div>
          
          <button 
            onClick={handleShutdown}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <Power size={16} />
            <span>Shutdown App</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-950 border-b border-slate-800 z-20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="text-emerald-500" />
          <span className="font-bold text-white">GATE Nexus</span>
        </div>
        <button onClick={() => setActiveTab('dashboard')} className="text-slate-400">
          <BarChart3 />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              csProgress={csProgress} 
              daProgress={daProgress} 
              todos={todos} 
              setTodos={setTodos}
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'syllabus-cs' && (
            <Syllabus 
              data={SYLLABUS_CS} 
              title="CS" 
              colorClass="text-emerald-400" 
              checkedTopics={checkedTopics}
              toggleTopic={toggleTopic}
              handleExplainTopic={handleExplainTopic}
              progress={csProgress}
            />
          )}
          {activeTab === 'syllabus-da' && (
            <Syllabus 
              data={SYLLABUS_DA} 
              title="DA" 
              colorClass="text-violet-400" 
              checkedTopics={checkedTopics}
              toggleTopic={toggleTopic}
              handleExplainTopic={handleExplainTopic}
              progress={daProgress}
            />
          )}
          {activeTab === 'library' && (
            <Library 
              library={library} 
              setLibrary={setLibrary} 
              SYLLABUS_CS={SYLLABUS_CS} 
              SYLLABUS_DA={SYLLABUS_DA} 
            />
          )}
          {activeTab === 'tools' && (
            <Tools 
              timerActive={timers[visibleMode].isActive} 
              setTimerActive={(val) => setTimers(prev => ({ ...prev, [visibleMode]: { ...prev[visibleMode], isActive: val } }))} 
              timeLeft={timers[visibleMode].timeLeft} 
              timerMode={visibleMode} 
              resetTimer={resetTimer} 
              stopTimer={stopTimer}
              switchTimerMode={switchTimerMode}
              notes={notes} 
              setNotes={setNotes}
              formatTime={formatTime}
              sessionLabel={sessionLabel}
              setSessionLabel={setSessionLabel}
              customDurations={customDurations}
              setCustomDurations={setCustomDurations}
              lastUpdated={lastUpdated}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
