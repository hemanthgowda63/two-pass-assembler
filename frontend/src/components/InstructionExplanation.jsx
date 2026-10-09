import React from 'react';
import { Info, ArrowRight, Zap } from 'lucide-react';

export default function InstructionExplanation({ currentStep }) {
  if (!currentStep) {
    return (
      <div className="brutalist-card p-5 h-full flex flex-col justify-center items-center text-center bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        <Info className="w-8 h-8 mb-2 text-black" />
        <p className="text-sm font-bold">No Active Execution Step.</p>
        <p className="text-xs font-medium">Click "Assemble & Execute" or "Step Forward" to start.</p>
      </div>
    );
  }

  const {
    stepNumber,
    address,
    opcode,
    operand,
    rawLine,
    objectCode,
    explanation,
    operationFormula,
    memoryChanges
  } = currentStep;

  return (
    <div className="brutalist-card bg-cyan-100 p-5 flex flex-col justify-between h-full border-3 border-black shadow-[6px_6px_0px_0px_#000]">
      <div>
        <div className="flex items-center justify-between mb-3 border-b-3 border-black pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-black fill-current" />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Instruction Breakdown
            </span>
          </div>
          <span className="brutalist-badge brutalist-badge-yellow">Step {stepNumber}</span>
        </div>

        {/* Mnemonic & Address Box */}
        <div className="bg-white p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000] mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold font-mono uppercase">Location Counter: 0x{address}</div>
            <div className="text-xl font-black font-mono text-black">
              {rawLine || `${opcode} ${operand}`}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold font-mono uppercase">Object Code</div>
            <div className="text-sm font-black font-mono bg-yellow-300 px-2 py-0.5 border-2 border-black">
              {objectCode || 'NONE'}
            </div>
          </div>
        </div>

        {/* Human Explanation */}
        <div className="bg-white p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000] mb-3">
          <div className="text-xs font-extrabold text-black mb-1 flex items-center gap-1.5 uppercase">
            <Info className="w-4 h-4 text-black" />
            <span>Educational Explanation</span>
          </div>
          <p className="text-xs font-semibold text-stone-900 leading-relaxed">{explanation}</p>
        </div>

        {/* Formula */}
        {operationFormula && (
          <div className="flex items-center justify-between text-xs font-mono bg-yellow-200 p-2.5 border-2 border-black font-bold">
            <span className="text-black uppercase">Operation:</span>
            <span className="text-black font-black">{operationFormula}</span>
          </div>
        )}
      </div>

      {/* Memory Changes Callout */}
      {memoryChanges && memoryChanges.length > 0 && (
        <div className="mt-3 bg-green-300 p-2.5 border-3 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-mono">
          <div className="text-black font-black mb-1 uppercase">
            Memory Updated:
          </div>
          {memoryChanges.map((mc, idx) => (
            <div key={idx} className="flex items-center justify-between text-black font-bold text-[11px]">
              <span>{mc.label} (0x{mc.address})</span>
              <div className="flex items-center gap-1">
                <span>{mc.oldValue}</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="font-black text-black underline">{mc.newValue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
