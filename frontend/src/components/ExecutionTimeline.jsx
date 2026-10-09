import React from 'react';
import { History, CheckCircle2, Circle } from 'lucide-react';

export default function ExecutionTimeline({
  executionTrace,
  currentStepIndex,
  onSelectStep
}) {
  return (
    <div className="brutalist-card bg-white p-4 h-full flex flex-col justify-between border-3 border-black shadow-[6px_6px_0px_0px_#000]">
      <div className="flex items-center gap-2 mb-3 border-b-3 border-black pb-2">
        <History className="w-5 h-5 text-black" />
        <h2 className="text-sm font-black tracking-wide text-black uppercase">
          Execution Timeline
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
        {(!executionTrace || executionTrace.length === 0) ? (
          <div className="text-xs font-bold text-stone-500 py-4 w-full text-center">
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
                className={`flex-none w-44 p-3 border-3 border-black cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'bg-yellow-300 shadow-[4px_4px_0px_0px_#000] scale-[1.02]'
                    : isPast
                    ? 'bg-green-200 opacity-90 hover:opacity-100 shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white shadow-[2px_2px_0px_0px_#000] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-black uppercase mb-1">
                  <span>Step {step.stepNumber}</span>
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-black fill-green-400" />
                  ) : (
                    <Circle className={`w-4 h-4 ${isSelected ? 'fill-yellow-400 text-black' : 'text-black'}`} />
                  )}
                </div>

                <div className="font-mono text-xs font-black text-black truncate">
                  {step.opcode} {step.operand}
                </div>

                <div className="text-[10px] text-black font-mono font-bold mt-1 flex justify-between">
                  <span>Addr: 0x{step.address}</span>
                  <span>{step.objectCode}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
