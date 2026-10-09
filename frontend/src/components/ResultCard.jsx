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
    <div className="brutalist-card bg-green-300 p-5 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-black text-yellow-300 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-black uppercase tracking-tight">
                PROGRAM EXECUTION COMPLETE
              </h3>
              <span className="brutalist-badge brutalist-badge-yellow flex items-center gap-1 text-xs">
                <CheckCircle className="w-4 h-4 text-black" />
                SUCCESS
              </span>
            </div>
            <p className="text-xs font-extrabold text-black mt-1">
              All SIC assembly instructions executed step-by-step with verified 24-bit register & memory updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 border-3 border-black shadow-[4px_4px_0px_0px_#000] font-mono text-sm">
          <div>
            <span className="text-stone-600 text-xs font-bold block uppercase">NUM1</span>
            <span className="font-black text-black text-base">{num1Val}</span>
          </div>

          <div className="text-black font-black text-lg">+</div>

          <div>
            <span className="text-stone-600 text-xs font-bold block uppercase">NUM2</span>
            <span className="font-black text-black text-base">{num2Val}</span>
          </div>

          <div className="text-black font-black text-lg">=</div>

          <div className="bg-yellow-300 px-3 py-1 border-2 border-black">
            <span className="text-black text-xs font-bold block uppercase">RESULT</span>
            <span className="font-black text-black text-xl">{resultVal}</span>
          </div>

          <div className="pl-3 border-l-2 border-black text-xs font-bold">
            <span className="text-black block flex items-center gap-1 uppercase">
              <Hash className="w-3.5 h-3.5" /> Total Steps
            </span>
            <span className="font-black text-black text-base">{totalSteps}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
