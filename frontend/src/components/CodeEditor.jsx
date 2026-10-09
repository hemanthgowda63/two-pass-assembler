import React from 'react';
import { Code, Play, RefreshCw } from 'lucide-react';

export default function CodeEditor({
  code,
  onChangeCode,
  currentLineNumber,
  onAssembleAndRun,
  isAssembling
}) {
  const lines = code.split('\n');

  return (
    <div className="glass-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wide text-gray-200 uppercase">
            Assembly Code Editor
          </h2>
        </div>
        <button
          onClick={onAssembleAndRun}
          disabled={isAssembling}
          className="btn btn-primary text-xs py-1.5 px-3"
        >
          {isAssembling ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          Assemble & Run
        </button>
      </div>

      <div className="relative flex-1 flex rounded-lg overflow-hidden border border-gray-800 bg-[#0a0f1d] font-mono text-sm">
        {/* Line Numbers */}
        <div className="py-3 px-2.5 bg-[#0e1628] text-gray-500 select-none text-right font-mono text-xs border-r border-gray-800/80">
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = lineNum === currentLineNumber;
            return (
              <div
                key={idx}
                className={`h-6 leading-6 px-1 transition-colors ${
                  isCurrent
                    ? 'text-yellow-400 font-bold bg-yellow-500/20 rounded-sm'
                    : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Text Area Input */}
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-3 bg-transparent text-gray-200 resize-none outline-none font-mono text-xs leading-6 selection:bg-cyan-500/30"
          placeholder="Enter SIC Assembly code here..."
        />
      </div>

      <div className="mt-2 text-[11px] text-gray-500 flex items-center justify-between">
        <span>Standard SIC Instructions Supported (LDA, ADD, STA, JSUB, RSUB, WORD, RESW...)</span>
        <span>{lines.length} Lines</span>
      </div>
    </div>
  );
}
