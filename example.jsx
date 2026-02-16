import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  BarChart3, 
  Clock, 
  BrainCircuit, 
  Cpu, 
  FileText, 
  Terminal, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Save,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Target,
  ExternalLink,
  Zap,
  MonitorPlay,
  AlertCircle,
  Layout,
  Sparkles,
  Bot,
  X,
  Loader2,
  Wand2,
  Library,
  FolderOpen,
  Link as LinkIcon,
  Plus,
  Book
} from 'lucide-react';

// --- API Integration ---

const apiKey = ""; // API Key provided by environment

const callGemini = async (prompt, systemInstruction = "") => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const makeRequest = async (retryCount = 0) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    } catch (error) {
      if (retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return makeRequest(retryCount + 1);
      }
      throw error;
    }
  };

  return makeRequest();
};

// --- Data: Syllabus Definitions with Weightage ---

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

// --- Components ---

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

// --- Main Application ---

export default function GateNexus() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkedTopics, setCheckedTopics] = useState({});
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [library, setLibrary] = useState({
    pyqs: {}, // { "2020": true }
    topicPyqs: {}, // { "Linear Algebra": true }
    books: [] // [{ id, title, totalCh, readCh }]
  });
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState('focus');

  // AI State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState({ title: '', body: '' });

  // Persistence
  useEffect(() => {
    const savedTopics = localStorage.getItem('gate_topics');
    const savedTodos = localStorage.getItem('gate_todos');
    const savedNotes = localStorage.getItem('gate_notes');
    const savedLibrary = localStorage.getItem('gate_library');
    
    if (savedTopics) setCheckedTopics(JSON.parse(savedTopics));
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedLibrary) setLibrary(JSON.parse(savedLibrary));
  }, []);

  useEffect(() => {
    localStorage.setItem('gate_topics', JSON.stringify(checkedTopics));
  }, [checkedTopics]);

  useEffect(() => {
    localStorage.setItem('gate_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('gate_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('gate_library', JSON.stringify(library));
  }, [library]);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const toggleTopic = (topicId) => {
    setCheckedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
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
    setTimerActive(false);
    setTimerMode(mode);
    if (mode === 'focus') setTimeLeft(25 * 60);
    if (mode === 'short') setTimeLeft(5 * 60);
    if (mode === 'long') setTimeLeft(15 * 60);
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

  // --- Views ---

  const AIModal = () => {
    if (!aiModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-xl">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Sparkles size={20} />
              <span>GATE AI Tutor</span>
            </div>
            <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
                <span className="text-sm text-slate-500">Consulting the neural network...</span>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-4">{aiContent.title}</h3>
                <div className="prose prose-invert max-w-none">
                  {aiContent.body}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const LibraryView = () => {
    const years = Array.from({ length: 16 }, (_, i) => 2025 - i); // 2025 to 2010
    const [newBookTitle, setNewBookTitle] = useState("");
    const [newBookCh, setNewBookCh] = useState(10);

    const togglePyq = (year) => {
      setLibrary(prev => ({
        ...prev,
        pyqs: { ...prev.pyqs, [year]: !prev.pyqs[year] }
      }));
    };

    const toggleTopicPyq = (topic) => {
      setLibrary(prev => ({
        ...prev,
        topicPyqs: { ...prev.topicPyqs, [topic]: !prev.topicPyqs[topic] }
      }));
    };

    const addBook = (e) => {
      e.preventDefault();
      if (!newBookTitle.trim()) return;
      setLibrary(prev => ({
        ...prev,
        books: [...prev.books, { id: Date.now(), title: newBookTitle, totalCh: Number(newBookCh), readCh: 0 }]
      }));
      setNewBookTitle("");
    };

    const updateBookProgress = (id, delta) => {
      setLibrary(prev => ({
        ...prev,
        books: prev.books.map(b => {
          if (b.id === id) {
            const newRead = Math.max(0, Math.min(b.totalCh, b.readCh + delta));
            return { ...b, readCh: newRead };
          }
          return b;
        })
      }));
    };

    const removeBook = (id) => {
      setLibrary(prev => ({
        ...prev,
        books: prev.books.filter(b => b.id !== id)
      }));
    };

    return (
      <div className="space-y-8 animate-in fade-in">
        <header>
          <h1 className="text-3xl font-bold text-white">Resource Library</h1>
          <p className="text-slate-400">Organize and track your local study materials.</p>
        </header>

        {/* Section 1: Year-wise PYQ Vault */}
        <Card>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500">
              <FolderOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">PYQ Vault</h3>
              <p className="text-xs text-slate-500">Track solved papers (Year-wise)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {years.map(year => (
              <button
                key={year}
                onClick={() => togglePyq(year)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  library.pyqs[year] 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-lg font-bold">{year}</div>
                <div className="text-[10px] uppercase tracking-wide mt-1">
                  {library.pyqs[year] ? 'Solved' : 'Pending'}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 2: Topic-wise Tracker */}
          <Card>
             <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Topic Binders</h3>
                  <p className="text-xs text-slate-500">Track topic-wise question banks</p>
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {[...SYLLABUS_CS, ...SYLLABUS_DA].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="text-sm font-medium text-slate-300 truncate flex-1 mr-4">{s.title}</span>
                    <button
                       onClick={() => toggleTopicPyq(s.title)}
                       className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                         library.topicPyqs[s.title]
                           ? 'bg-blue-500 border-blue-500 text-white'
                           : 'border-slate-600 text-transparent hover:border-blue-400'
                       }`}
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
          </Card>

          {/* Section 3: Bookshelf */}
          <Card>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500">
                  <Library size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Bookshelf</h3>
                  <p className="text-xs text-slate-500">Reading progress tracker</p>
                </div>
              </div>

              {/* Add Book Form */}
              <form onSubmit={addBook} className="flex gap-2 mb-6">
                <input 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Book Title (e.g. Rosen Discrete Math)"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                />
                <input 
                  type="number"
                  className="w-20 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Chs"
                  value={newBookCh}
                  onChange={(e) => setNewBookCh(e.target.value)}
                />
                <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white">
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-4">
                {library.books.length === 0 && <div className="text-center text-slate-600 py-4 text-sm">No books added yet.</div>}
                {library.books.map(book => (
                  <div key={book.id} className="bg-slate-950 border border-slate-800 rounded p-4">
                    <div className="flex justify-between items-start mb-3">
                       <div className="font-medium text-slate-200 flex items-center gap-2">
                         <Book size={14} className="text-emerald-500" />
                         {book.title}
                       </div>
                       <button onClick={() => removeBook(book.id)} className="text-slate-600 hover:text-red-400">
                         <X size={14} />
                       </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all" 
                          style={{width: `${(book.readCh / book.totalCh) * 100}%`}}
                        ></div>
                      </div>
                      <div className="text-xs font-mono text-slate-400 w-16 text-right">
                        {book.readCh}/{book.totalCh} Ch
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                       <button onClick={() => updateBookProgress(book.id, -1)} className="text-xs px-2 py-1 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800">-</button>
                       <button onClick={() => updateBookProgress(book.id, 1)} className="text-xs px-2 py-1 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800">+</button>
                    </div>
                  </div>
                ))}
              </div>
          </Card>
        </div>
      </div>
    );
  };

  const DashboardView = () => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <button onClick={() => setActiveTab('exam-sim')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group">
              <div className="font-medium text-red-400 group-hover:translate-x-1 transition-transform">Mock Exam UI</div>
              <div className="text-xs text-slate-400">Practice Interface</div>
            </button>
            <button onClick={() => setActiveTab('planner')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group">
              <div className="font-medium text-blue-400 group-hover:translate-x-1 transition-transform">Daily Goals</div>
              <div className="text-xs text-slate-400">{todos.filter(t => !t.done).length} pending tasks</div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );

  const SyllabusView = ({ data, title, colorClass }) => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h1 className={`text-3xl font-bold ${colorClass} tracking-tight`}>{title} Syllabus</h1>
          <p className="text-slate-400 mt-1">Detailed topic breakdown with estimated weightage</p>
        </div>
        <div className="text-right">
           <span className="text-2xl font-mono font-bold text-white">
             {title === 'CS' ? csProgress : daProgress}%
           </span>
           <span className="text-xs text-slate-500 block uppercase tracking-wider">Completed</span>
        </div>
      </header>

      <div className="space-y-4">
        {data.map((section) => {
          const sectionTopics = section.topics;
          const checkedCount = sectionTopics.filter(t => checkedTopics[`${section.id}-${t}`]).length;
          const isComplete = checkedCount === sectionTopics.length;
          
          return (
            <div key={section.id} className="group bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg transition-colors ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {isComplete ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">
                           {section.title}
                         </h3>
                         <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                           {section.weightage}
                         </span>
                      </div>
                      <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div className={`h-full ${colorClass.replace('text', 'bg')}`} style={{width: `${(checkedCount/sectionTopics.length)*100}%`}}></div>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="text-slate-500 group-open:rotate-180 transition-transform ml-4" />
                </summary>
                
                <div className="p-4 pt-0 border-t border-slate-800/50 bg-slate-900/50">
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {section.topics.map((topic, idx) => {
                      const uniqueId = `${section.id}-${topic}`;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded group/item transition-colors">
                           <label className="flex items-start gap-3 cursor-pointer flex-1">
                            <div className="relative flex items-center mt-0.5">
                              <input 
                                type="checkbox"
                                className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-transparent checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                                checked={!!checkedTopics[uniqueId]}
                                onChange={() => toggleTopic(uniqueId)}
                              />
                              <CheckCircle2 className="w-3.5 h-3.5 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                            </div>
                            <span className={`text-sm transition-all ${checkedTopics[uniqueId] ? 'text-slate-500 line-through' : 'text-slate-300 group-hover/item:text-white'}`}>
                              {topic}
                            </span>
                          </label>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleExplainTopic(topic)}
                              className="p-1.5 rounded text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all opacity-0 group-hover/item:opacity-100"
                              title="Explain with AI"
                            >
                              <Sparkles size={14} />
                            </button>
                            <a 
                              href={`https://www.google.com/search?q=GATE+${title}+${encodeURIComponent(topic)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 rounded text-slate-500 hover:bg-blue-500/20 hover:text-blue-400 transition-all opacity-0 group-hover/item:opacity-100"
                              title="Search Resources"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ExamSimulator = () => {
    // Mock Data for UI Simulation
    const mockQuestions = Array.from({length: 65}, (_, i) => ({
      id: i + 1,
      status: i === 0 ? 'current' : 'not_visited', // current, visited, answered, marked, marked_answered
      type: i < 10 ? 'GA' : 'Core',
      marks: i % 3 === 0 ? 2 : 1
    }));
    
    const [selectedQ, setSelectedQ] = useState(1);
    const [timer, setTimer] = useState(180 * 60); // 3 hours
    const [aiQuestion, setAiQuestion] = useState(null);
    const [loadingQ, setLoadingQ] = useState(false);

    useEffect(() => {
       const i = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
       return () => clearInterval(i);
    }, []);

    const generateAIQuestion = async () => {
      setLoadingQ(true);
      try {
        const prompt = `Generate a tough GATE-level Multiple Choice Question for Computer Science. 
        Format exactly like this:
        Question: [The question text]
        A) [Option A]
        B) [Option B]
        C) [Option C]
        D) [Option D]
        Correct: [Correct Option Letter]`;
        const res = await callGemini(prompt, "You are a strict GATE examiner.");
        setAiQuestion(res);
      } catch (e) {
        setAiQuestion("Error generating question. Try again.");
      } finally {
        setLoadingQ(false);
      }
    }

    return (
      <div className="h-[calc(100vh-140px)] flex flex-col animate-in zoom-in-95 duration-300">
        <header className="flex justify-between items-center bg-white text-slate-900 p-4 rounded-t-lg border-b border-slate-300">
          <div className="flex items-center gap-4">
             <div className="font-bold text-xl">GATE 2026 Simulation</div>
             <span className="px-3 py-1 bg-slate-200 rounded text-sm font-mono">Subject: CS/DA</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500">Time Remaining</span>
                <span className="text-xl font-mono font-bold text-slate-900">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-300"></div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden bg-slate-100 text-slate-900">
           {/* Question Area */}
           <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm border border-slate-200 min-h-[500px]">
                 <div className="flex justify-between border-b border-slate-100 pb-4 mb-6">
                    <h3 className="font-bold text-lg">Question {selectedQ}</h3>
                    <span className="text-sm text-slate-500">Marks: {mockQuestions[selectedQ-1].marks}</span>
                 </div>
                 
                 {aiQuestion ? (
                    <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-100 mb-6">
                      <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                        <Sparkles size={16} /> AI Generated Challenge
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-slate-800">{aiQuestion}</pre>
                      <button onClick={() => setAiQuestion(null)} className="mt-4 text-sm text-indigo-600 underline">Back to Standard</button>
                    </div>
                 ) : (
                   <div className="space-y-6">
                      <p className="text-lg leading-relaxed">
                         This is a simulation of the GATE exam question interface. In a real scenario, the question text, images, and equations would appear here.
                      </p>
                      <div className="p-4 bg-slate-50 rounded border border-slate-200 font-mono text-sm text-slate-600">
                         // Mock Question Content <br/>
                         Let G be a simple undirected graph...
                      </div>
                      
                      <div className="space-y-3 mt-8">
                         {['Option A', 'Option B', 'Option C', 'Option D'].map((opt, i) => (
                           <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-blue-50 cursor-pointer transition-colors">
                              <input type="radio" name="opt" className="w-5 h-5 text-blue-600" />
                              <span>{opt}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
              
              <div className="max-w-4xl mx-auto mt-6 flex justify-between gap-4">
                 <button 
                   onClick={generateAIQuestion}
                   disabled={loadingQ}
                   className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                 >
                   {loadingQ ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                   Generate AI Question ✨
                 </button>
                 <div className="flex gap-4">
                    <button className="px-6 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 font-medium">Clear Response</button>
                    <button 
                      className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-sm"
                      onClick={() => setSelectedQ(prev => Math.min(65, prev + 1))}
                    >Save & Next</button>
                 </div>
              </div>
           </div>

           {/* Palette */}
           <div className="w-80 bg-blue-50 border-l border-blue-100 flex flex-col">
              <div className="p-4 border-b border-blue-100 bg-blue-100/50">
                 <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-sm"></div> Answered</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-sm"></div> Not Answered</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-200 rounded-sm border border-slate-300"></div> Not Visited</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-500 rounded-sm"></div> Marked</div>
                 </div>
                 <h4 className="font-bold text-blue-900">Question Palette</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                 <div className="grid grid-cols-4 gap-2">
                    {mockQuestions.map((q) => (
                       <button 
                         key={q.id}
                         onClick={() => setSelectedQ(q.id)}
                         className={`h-10 w-10 rounded font-bold text-sm flex items-center justify-center transition-all ${selectedQ === q.id ? 'bg-blue-600 text-white ring-2 ring-offset-1 ring-blue-600' : 'bg-white border border-slate-300 hover:bg-blue-100 text-slate-700'}`}
                       >
                         {q.id}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="p-4 border-t border-blue-200 bg-blue-100">
                 <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow">Submit Exam</button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const PlannerView = () => {
    const [newTodo, setNewTodo] = useState('');
    const [aiPlanGoal, setAiPlanGoal] = useState('');
    const [planning, setPlanning] = useState(false);

    const addTodo = (e) => {
      e.preventDefault();
      if (!newTodo.trim()) return;
      setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
      setNewTodo('');
    };

    const generateStudyPlan = async (e) => {
      e.preventDefault();
      if (!aiPlanGoal.trim()) return;
      setPlanning(true);
      try {
        const prompt = `Create a concise study checklist for the goal: "${aiPlanGoal}". 
        Return ONLY a list of 3-5 actionable tasks, separated by newlines. 
        No numbering, no intro text.`;
        
        const response = await callGemini(prompt, "You are a study planner.");
        const newTasks = response.split('\n').filter(t => t.trim().length > 0).map((t, i) => ({
          id: Date.now() + i,
          text: t.replace(/^[-\d.]+\s*/, ''), // remove leading numbers/dashes
          done: false
        }));
        setTodos(prev => [...prev, ...newTasks]);
        setAiPlanGoal('');
      } catch (err) {
        alert("Failed to generate plan.");
      } finally {
        setPlanning(false);
      }
    };

    const toggleTodo = (id) => {
      setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const deleteTodo = (id) => {
      setTodos(todos.filter(t => t.id !== id));
    };

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
        <header>
          <h1 className="text-3xl font-bold text-white">Study Planner</h1>
          <p className="text-slate-400">Manage your daily objectives.</p>
        </header>

        {/* AI Planner Section */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles size={64} className="text-indigo-400" />
           </div>
           <h3 className="text-lg font-semibold text-indigo-200 mb-2 flex items-center gap-2">
             <Bot size={20} /> Ask AI to Plan
           </h3>
           <form onSubmit={generateStudyPlan} className="flex gap-2 relative z-10">
            <input
              type="text"
              value={aiPlanGoal}
              onChange={(e) => setAiPlanGoal(e.target.value)}
              placeholder="e.g. 'Master Eigenvalues in 2 hours' or 'Review TOC basics'"
              className="flex-1 bg-slate-950/50 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={planning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {planning ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {planning ? 'Thinking...' : 'Generate Plan'}
            </button>
          </form>
        </div>

        <Card>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Manual Entry</h3>
          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task manually..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
              Add
            </button>
          </form>

          <div className="space-y-2">
            {todos.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No goals set for today.
              </div>
            )}
            {todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-lg group">
                <button onClick={() => toggleTodo(todo.id)} className={`p-1 rounded-full border-2 ${todo.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-emerald-400'}`}>
                   {todo.done && <CheckCircle2 size={14} className="text-white" />}
                </button>
                <span className={`flex-1 ${todo.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const ToolsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
      {/* Pomodoro */}
      <Card className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-8 relative">
          <div className="w-64 h-64 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
             <div className={`absolute inset-0 rounded-full border-8 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent rotate-45 transition-all duration-1000 ${timerActive ? 'animate-spin-slow' : ''}`}></div>
             <div className="text-6xl font-mono font-bold text-white tracking-wider">
               {formatTime(timeLeft)}
             </div>
          </div>
        </div>
        
        <div className="flex gap-4 mb-8">
          <button onClick={() => resetTimer('focus')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timerMode === 'focus' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}>Focus</button>
          <button onClick={() => resetTimer('short')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timerMode === 'short' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-white'}`}>Short Break</button>
          <button onClick={() => resetTimer('long')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timerMode === 'long' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-white'}`}>Long Break</button>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setTimerActive(!timerActive)}
            className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
          >
            {timerActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={() => resetTimer(timerMode)}
            className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </Card>

      {/* Quick Notes */}
      <div className="flex flex-col h-full">
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
  );

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
      <AIModal />
      
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
          <NavItem id="library" icon={Library} label="Library & PYQs" color="text-amber-400" />
          <NavItem id="exam-sim" icon={MonitorPlay} label="Exam Simulator" color="text-red-400" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Tools</div>
          <NavItem id="planner" icon={Calendar} label="Study Planner" color="text-orange-400" />
          <NavItem id="tools" icon={Clock} label="Focus Timer" color="text-pink-400" />
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
              U
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">Aspirant</div>
              <div className="text-xs text-slate-500">Keep grinding!</div>
            </div>
          </div>
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
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'syllabus-cs' && <SyllabusView data={SYLLABUS_CS} title="CS" colorClass="text-emerald-400" />}
          {activeTab === 'syllabus-da' && <SyllabusView data={SYLLABUS_DA} title="DA" colorClass="text-violet-400" />}
          {activeTab === 'library' && <LibraryView />}
          {activeTab === 'exam-sim' && <ExamSimulator />}
          {activeTab === 'planner' && <PlannerView />}
          {activeTab === 'tools' && <ToolsView />}
        </div>
      </main>
    </div>
  );
}