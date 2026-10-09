import React from 'react';
import { Info, ArrowRight, Zap } from 'lucide-react';

export default function InstructionExplanation({ currentStep }) {
  if (!currentStep) {
    return (
      <div className="glass-card p-5 h-full flex flex-col justify-center items-center text-center text-gray-500">
        <Info className="w-8 h-8 mb-2 text-cyan-500/40" />
        <p className="text-sm font-medium">No active execution step.</p>
        <p className="text-xs">Click "Assemble & Run" or "Step Forward" to begin simulation.</p>
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
    <div className="glass-card p-5 flex flex-col justify-between h-full border-l-4 border-l-cyan-400">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Current Instruction Execution
            </span>
          </div>
          <span className="badge badge-cyan">Step {stepNumber}</span>
        </div>

        {/* Mnemonic & Address Box */}
        <div className="bg-[#0c1322] p-3 rounded-lg border border-cyan-500/30 mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-gray-400 font-mono">Location Counter: 0x{address}</div>
            <div className="text-lg font-bold font-mono text-white tracking-wide">
              {rawLine || `${opcode} ${operand}`}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-gray-400 font-mono">Object Code</div>
            <div className="text-sm font-bold font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {objectCode || 'NONE'}
            </div>
          </div>
        </div>

        {/* Human Explanation */}
        <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-800 mb-3">
          <div className="text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Educational Breakdown</span>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed">{explanation}</p>
        </div>

        {/* Formula */}
        {operationFormula && (
          <div className="flex items-center justify-between text-xs font-mono bg-black/40 p-2.5 rounded-md border border-gray-800 text-gray-300">
            <span className="text-gray-500">Operation:</span>
            <span className="font-bold text-cyan-300">{operationFormula}</span>
          </div>
        )}
      </div>

      {/* Memory Changes Callout */}
      {memoryChanges && memoryChanges.length > 0 && (
        <div className="mt-3 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30 text-xs font-mono">
          <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
            <span>Memory Updated:</span>
          </div>
          {memoryChanges.map((mc, idx) => (
            <div key={idx} className="flex items-center justify-between text-gray-300 text-[11px]">
              <span>{mc.label} (0x{mc.address})</span>
              <div className="flex items-center gap-1 text-emerald-300 font-bold">
                <span>{mc.oldValue}</span>
                <ArrowRight className="w-3 h-3 text-gray-500" />
                <span>{mc.newValue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
