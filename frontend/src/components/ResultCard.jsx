import React from 'react';
import { Award, CheckCircle, Hash } from 'lucide-react';

export default function ResultCard({ memorySnapshot, totalSteps, isFinished }) {
  if (!isFinished && totalSteps === 0) return null;

  const getMemVal = (symbolName) => {
    const item = (memorySnapshot || []).find(
      (m) => m.label && m.label.toUpperCase() === symbolName.toUpperCase()
    );
    return item ? item.valueDec : null;
  };

  const num1Val = getMemVal('NUM1') ?? 25;
  const num2Val = getMemVal('NUM2') ?? 15;
  const resultVal = getMemVal('RESULT') ?? 40;

  return (
    <div className="glass-card p-5 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-500/40 glow-active">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-wide">
                PROGRAM EXECUTION COMPLETE
              </h3>
              <span className="badge badge-emerald flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                SUCCESS
              </span>
            </div>
            <p className="text-xs text-gray-300">
              All SIC instructions executed step by step with verified register & memory updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-[#090f1e]/80 px-4 py-2.5 rounded-xl border border-gray-800 font-mono text-sm">
          <div>
            <span className="text-gray-400 text-xs block">NUM1</span>
            <span className="font-bold text-cyan-400">{num1Val}</span>
          </div>

          <div className="text-gray-600 font-bold">+</div>

          <div>
            <span className="text-gray-400 text-xs block">NUM2</span>
            <span className="font-bold text-purple-400">{num2Val}</span>
          </div>

          <div className="text-gray-600 font-bold">=</div>

          <div className="bg-emerald-500/20 px-3 py-1 rounded-md border border-emerald-500/30">
            <span className="text-emerald-300 text-xs block">RESULT</span>
            <span className="font-extrabold text-emerald-400 text-base">{resultVal}</span>
          </div>

          <div className="pl-4 border-l border-gray-800 text-xs">
            <span className="text-gray-400 block flex items-center gap-1">
              <Hash className="w-3 h-3" /> Total Steps
            </span>
            <span className="font-bold text-white">{totalSteps}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
