import React from 'react';
import { History, CheckCircle2, Circle } from 'lucide-react';

export default function ExecutionTimeline({
  executionTrace,
  currentStepIndex,
  onSelectStep
}) {
  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-sky-400" />
        <h2 className="text-sm font-bold tracking-wide text-gray-200 uppercase">
          Execution Timeline & Trace History
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {(!executionTrace || executionTrace.length === 0) ? (
          <div className="text-xs text-gray-500 py-4 w-full text-center">
            No step history generated yet.
          </div>
        ) : (
          executionTrace.map((step, idx) => {
            const isSelected = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;

            return (
              <div
                key={idx}
                onClick={() => onSelectStep(idx)}
                className={`flex-none w-44 p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.3)] scale-[1.02]'
                    : isPast
                    ? 'bg-[#0f172a]/80 border-gray-700/80 opacity-80 hover:opacity-100'
                    : 'bg-[#0a0f1d]/40 border-gray-800 text-gray-500 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-cyan-400">Step {step.stepNumber}</span>
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Circle className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400 fill-cyan-400/20' : 'text-gray-600'}`} />
                  )}
                </div>

                <div className="font-mono text-xs font-bold text-white truncate">
                  {step.opcode} {step.operand}
                </div>

                <div className="text-[10px] text-gray-400 font-mono mt-1 flex justify-between">
                  <span>Addr: 0x{step.address}</span>
                  <span>Code: {step.objectCode}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
