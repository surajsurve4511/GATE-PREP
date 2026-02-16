import React, { useState } from 'react';
import { CheckCircle2, BookOpen, ChevronDown, Sparkles, ExternalLink } from 'lucide-react';

const Syllabus = ({ data, title, colorClass, checkedTopics, toggleTopic, handleExplainTopic, progress }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h1 className={`text-3xl font-bold ${colorClass} tracking-tight`}>{title} Syllabus</h1>
          <p className="text-slate-400 mt-1">Detailed topic breakdown with estimated weightage</p>
        </div>
        <div className="text-right">
           <span className="text-2xl font-mono font-bold text-white">
             {progress}%
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
};

export default Syllabus;
