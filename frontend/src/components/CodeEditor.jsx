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
    <div className="brutalist-card flex flex-col h-full bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
      <div className="flex items-center justify-between mb-3 border-b-3 border-black pb-2">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-black" />
          <h2 className="text-sm font-black tracking-wide text-black uppercase">
            Assembly Source Editor
          </h2>
        </div>
        <button
          onClick={onAssembleAndRun}
          disabled={isAssembling}
          className="brutalist-btn brutalist-btn-green text-xs py-1.5 px-3"
        >
          {isAssembling ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          Assemble & Execute
        </button>
      </div>

      <div className="editor-container flex-1">
        {/* Line Numbers */}
        <div className="editor-line-numbers">
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCurrent = lineNum === currentLineNumber;
            return (
              <div
                key={idx}
                className={`editor-line-num ${isCurrent ? 'active' : ''}`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          spellCheck={false}
          className="editor-textarea"
          placeholder="Enter SIC Assembly code here..."
        />
      </div>

      <div className="mt-2 text-[11px] font-bold text-stone-700 flex items-center justify-between uppercase">
        <span>SIC Standard Opcodes Supported</span>
        <span>{lines.length} Lines Total</span>
      </div>
    </div>
  );
}
