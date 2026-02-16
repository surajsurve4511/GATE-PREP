import React from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

const AIModal = ({ aiModalOpen, setAiModalOpen, aiLoading, aiContent }) => {
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

export default AIModal;
