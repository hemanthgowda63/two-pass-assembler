import React from 'react';
import { Cpu, BookOpen, Server } from 'lucide-react';

export default function Header({ isConnected, onResetSample }) {
  return (
    <header className="brutalist-card bg-amber-300 flex flex-wrap items-center justify-between gap-4 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-black text-yellow-300 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <Cpu className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            SIC Assembly Visualizer
          </h1>
          <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">
            Step-by-Step Educational Execution Engine (Simplified Instructional Computer)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onResetSample}
          className="brutalist-btn brutalist-btn-white text-xs py-2 px-3"
        >
          <BookOpen className="w-4 h-4" />
          Load Sample Program
        </button>

        <div className={`brutalist-badge ${isConnected ? 'brutalist-badge-green' : 'brutalist-badge-cyan'}`}>
          <Server className="w-3.5 h-3.5" />
          <span>{isConnected ? 'JAVA BACKEND CONNECTED' : 'STANDALONE ENGINE READY'}</span>
        </div>
      </div>
    </header>
  );
}
