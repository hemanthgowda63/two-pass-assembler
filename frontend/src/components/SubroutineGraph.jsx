import React from 'react';
import { GitBranch, ArrowDown, CornerDownRight } from 'lucide-react';

export default function SubroutineGraph({ currentStep }) {
  const currentSubroutine = currentStep?.currentSubroutine || 'MAIN';
  const callDepth = currentStep?.callDepth || 0;
  const registerL = currentStep?.registersAfter?.L_HEX || '0000';

  return (
    <div className="brutalist-card bg-purple-100 p-4 h-full flex flex-col justify-between border-3 border-black shadow-[6px_6px_0px_0px_#000]">
      <div className="flex items-center justify-between mb-2 border-b-3 border-black pb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-black" />
          <h2 className="text-sm font-black tracking-wide text-black uppercase">
            Subroutine Call Graph (JSUB / RSUB)
          </h2>
        </div>
        <span className="brutalist-badge brutalist-badge-yellow text-[10px]">
          Depth: {callDepth}
        </span>
      </div>

      <div className="bg-white p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000] my-2 font-mono text-xs">
        {/* Main Box */}
        <div className="flex items-center justify-between p-2 bg-yellow-200 border-2 border-black font-bold">
          <span className="font-black text-black">MAIN Program</span>
          <span className="text-[10px] text-black">Addr: 0x3000</span>
        </div>

        {/* JSUB Connection Line */}
        <div className="py-2 px-3 flex items-center gap-2 text-black font-bold">
          <CornerDownRight className="w-4 h-4" />
          <div className="flex-1 border-t-2 border-dashed border-black"></div>
          <span className="text-[10px] bg-cyan-200 px-2 py-0.5 border border-black font-extrabold">
            JSUB ADDNUM (L ← {registerL})
          </span>
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Subroutine Box */}
        <div
          className={`p-2 border-2 border-black font-bold transition-all ${
            currentSubroutine === 'ADDNUM' || callDepth > 0
              ? 'bg-purple-300 text-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-black">ADDNUM Subroutine</span>
            <span className="text-[10px]">Addr: 0x300C</span>
          </div>
          <div className="text-[10px] mt-1 flex items-center justify-between">
            <span>Op: ADD NUM2</span>
            <span>RSUB returns to L (0x{registerL})</span>
          </div>
        </div>
      </div>

      <div className="text-xs font-bold text-black flex items-center justify-between bg-yellow-300 p-2 border-2 border-black">
        <span className="uppercase">Linkage Register (L):</span>
        <span className="font-mono font-black text-black">0x{registerL}</span>
      </div>
    </div>
  );
}
