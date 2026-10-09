import React from 'react';
import { Cpu, BookOpen, Server } from 'lucide-react';

export default function Header({ isConnected, onResetSample }) {
  return (
    <header className="glass-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 rounded-xl text-cyan-400">
          <Cpu className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            SIC Assembly Visualizer & Simulator
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Step-by-step execution of Simplified Instructional Computer (SIC)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onResetSample}
          className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          Load Sample Program
        </button>

        <div className={`badge ${isConnected ? 'badge-emerald' : 'badge-amber'} flex items-center gap-1.5`}>
          <Server className="w-3.5 h-3.5" />
          <span>{isConnected ? 'Java Backend Live' : 'Client Engine Ready'}</span>
        </div>
      </div>
    </header>
  );
}
