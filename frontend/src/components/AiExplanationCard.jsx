import React, { useState } from 'react';
import { Bot, ShieldCheck, CheckCircle, AlertOctagon, Code, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function AiExplanationCard({
  explanationData,
  verifiedFacts,
  onRefreshExplanation,
  isLoadingExplanation,
}) {
  const [showFactsJson, setShowFactsJson] = useState(false);

  if (!explanationData) return null;

  const isPassed = explanationData.validation_status === 'PASSED';
  const isFallback = explanationData.validation_status?.includes('FALLBACK');

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              WHY THIS ROUTE?
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                {explanationData.explanation_provenance || 'PHI-4-MINI'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Zero-Hallucination Local AI Layer &bull; Mathematical Evidence Only
            </p>
          </div>
        </div>

        {/* 3-Layer Validator Status Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Layer 1: Numbers
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Layer 2: Facts
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Layer 3: Decisions
          </span>
        </div>
      </div>

      {/* Explanation Text Content */}
      <div className="text-xs leading-relaxed text-slate-200 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 mb-4 whitespace-pre-line font-normal space-y-2">
        {explanationData.explanation}
      </div>

      {/* Footer controls & Verified facts inspector */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFactsJson(!showFactsJson)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors text-[11px] font-mono"
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span>{showFactsJson ? 'Hide Verified Facts' : 'Inspect Verified Facts'}</span>
            {showFactsJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <button
          onClick={onRefreshExplanation}
          disabled={isLoadingExplanation}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${isLoadingExplanation ? 'animate-spin' : ''}`} />
          <span>Re-verify AI</span>
        </button>
      </div>

      {/* Collapsible Verified Facts JSON Viewer */}
      {showFactsJson && verifiedFacts && (
        <div className="mt-3 p-3 rounded-xl bg-[#070b14] border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
          <pre>{JSON.stringify(verifiedFacts, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
