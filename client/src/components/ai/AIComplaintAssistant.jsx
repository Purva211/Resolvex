import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Check, ArrowRight, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export function AIComplaintAssistant({ 
  onAnalyze, 
  aiResult, 
  analyzing, 
  aiError, 
  onApply,
  description
}) {
  const [analysisStep, setAnalysisStep] = useState(0);

  const steps = [
    'Analyzing complaint context',
    'Categorizing complaint domain',
    'Evaluating severity & priority',
    'Calculating SLA timeframe'
  ];

  useEffect(() => {
    let interval;
    if (analyzing) {
      setAnalysisStep(0);
      interval = setInterval(() => {
        setAnalysisStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  return (
    <div className="ai-assistant-wrapper">
      {/* 1. Loading State */}
      {analyzing && (
        <div className="ai-card ai-loading-card">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-400 animate-spin">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">🤖 AI is analyzing your complaint...</h4>
              <p className="text-xs text-slate-400 mt-0.5">Evaluating text context with LLM classification model</p>
            </div>
          </div>

          <div className="space-y-2.5 mt-4 pt-2 border-t border-slate-800">
            {steps.map((stepLabel, idx) => {
              const isDone = idx < analysisStep;
              const isCurrent = idx === analysisStep;
              return (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700" />
                  )}
                  <span className={isDone ? 'text-slate-300 font-medium' : isCurrent ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
                    {stepLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Error / Fallback State */}
      {!analyzing && aiError && (
        <div className="ai-card ai-error-card">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-amber-950 text-amber-400 rounded-lg border border-amber-800 flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-300 text-sm">⚠️ AI Analysis Unavailable</h4>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {aiError || "We couldn't analyze this complaint automatically right now. You can continue by selecting the category and priority manually."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Pre-Analysis State */}
      {!analyzing && !aiResult && !aiError && (
        <div className="ai-card ai-prompt-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 rounded-xl flex-shrink-0">
                <Bot size={22} />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  🤖 AI Complaint Assistant
                  <span className="px-2 py-0.5 text-[10px] bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 rounded-full font-semibold">
                    Decision Support
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Let AI analyze your complaint description to recommend category, priority and department automatically.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onAnalyze}
              disabled={!description?.trim()}
              className="btn btn-primary text-xs flex items-center gap-2 flex-shrink-0 disabled:opacity-50 px-4"
            >
              <Sparkles size={15} />
              <span>Analyze with AI</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Recommendation Result State */}
      {!analyzing && aiResult && (
        <div className="ai-card ai-recommendation-card">
          <div className="ai-card-header flex justify-between items-center pb-3 border-b border-indigo-800/60">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <Bot size={16} />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">🤖 AI Recommendation</h4>
                <span className="text-[11px] text-slate-400">Review recommendations below</span>
              </div>
            </div>
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
              AI Suggestion
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-4">
            <div className="ai-stat-box">
              <span className="ai-stat-label">Category</span>
              <strong className="ai-stat-value text-slate-100">{aiResult.category}</strong>
            </div>

            <div className="ai-stat-box">
              <span className="ai-stat-label">Priority</span>
              <div className="mt-0.5">
                <PriorityBadge priority={aiResult.priority} />
              </div>
            </div>

            <div className="ai-stat-box">
              <span className="ai-stat-label">Department</span>
              <strong className="ai-stat-value text-slate-100">{aiResult.department}</strong>
            </div>

            <div className="ai-stat-box">
              <span className="ai-stat-label">Calculated SLA</span>
              <strong className="ai-stat-value text-indigo-400">{aiResult.slaHours} hours</strong>
            </div>
          </div>

          <div className="ai-reason-box mb-4">
            <span className="text-xs font-semibold text-slate-200 block mb-1">Why this classification?</span>
            <p className="text-xs text-slate-300 leading-relaxed">{aiResult.reason}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-indigo-900/40">
            <span className="text-[11px] text-slate-400">
              Human review: You can modify these values anytime below.
            </span>
            <button
              type="button"
              onClick={onApply}
              className="btn btn-emerald text-xs flex items-center gap-1.5 px-4"
            >
              <Check size={14} />
              <span>Apply Suggestions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
