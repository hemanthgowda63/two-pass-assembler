import React from 'react';
import { GitBranch, ArrowDown, CornerDownRight } from 'lucide-react';

export default function SubroutineGraph({ currentStep }) {
  const currentSubroutine = currentStep?.currentSubroutine || 'MAIN';
  const callDepth = currentStep?.callDepth || 0;
  const registerL = currentStep?.registersAfter?.L_HEX || '0000';

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold tracking-wide text-gray-200 uppercase">
            Subroutine Call Graph (JSUB / RSUB)
          </h2>
        </div>
        <span className="badge badge-purple text-[10px]">
          Depth: {callDepth}
        </span>
      </div>

      <div className="bg-[#0b1220] p-3 rounded-lg border border-purple-500/20 my-2 font-mono text-xs">
        {/* Main Box */}
        <div className="flex items-center justify-between p-2 rounded bg-indigo-950/40 border border-indigo-500/30">
          <span className="font-bold text-indigo-300">MAIN Program</span>
          <span className="text-[10px] text-gray-400">Addr: 0x3000</span>
        </div>

        {/* JSUB Connection Line */}
        <div className="py-2 px-4 flex items-center gap-2 text-purple-400">
          <CornerDownRight className="w-4 h-4" />
          <div className="flex-1 border-t border-dashed border-purple-500/40"></div>
          <span className="text-[10px] bg-purple-900/40 px-2 py-0.5 rounded text-purple-300">
            JSUB ADDNUM (L ← {registerL})
          </span>
          <ArrowDown className="w-3.5 h-3.5" />
        </div>

        {/* Subroutine Box */}
        <div
          className={`p-2 rounded border transition-all ${
            currentSubroutine === 'ADDNUM' || callDepth > 0
              ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              : 'bg-gray-900/40 border-gray-800 text-gray-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold">ADDNUM Subroutine</span>
            <span className="text-[10px]">Addr: 0x300C</span>
          </div>
          <div className="text-[10px] mt-1 text-gray-400 flex items-center justify-between">
            <span>Operations: ADD NUM2</span>
            <span>RSUB returns to L (0x{registerL})</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-gray-400 flex items-center justify-between bg-black/20 p-2 rounded border border-gray-800/60">
        <span>Linkage Register (L):</span>
        <span className="font-mono font-bold text-purple-300">0x{registerL}</span>
      </div>
    </div>
  );
}
