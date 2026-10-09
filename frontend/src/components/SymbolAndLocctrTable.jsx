import React, { useState } from 'react';
import { Tag, FileText } from 'lucide-react';

export default function SymbolAndLocctrTable({ symtab, intermediateLines }) {
  const [activeTab, setActiveTab] = useState('symtab');

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('symtab')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'symtab'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Symbol Table (SYMTAB)
          </button>

          <button
            onClick={() => setActiveTab('locctr')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'locctr'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            LOCCTR Assembler View
          </button>
        </div>
      </div>

      {/* SYMTAB View */}
      {activeTab === 'symtab' && (
        <div className="overflow-x-auto max-h-56 rounded-lg border border-gray-800 bg-[#090e1a]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0f172a] text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-2 px-3">Symbol Name</th>
                <th className="py-2 px-3 text-right">Hex Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {(!symtab || symtab.length === 0) ? (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    No symbols found.
                  </td>
                </tr>
              ) : (
                symtab.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 text-gray-300">
                    <td className="py-1.5 px-3 font-bold text-amber-300">
                      {item.symbol}
                    </td>
                    <td className="py-1.5 px-3 text-right text-cyan-400 font-bold">
                      0x{item.address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* LOCCTR Assembler View */}
      {activeTab === 'locctr' && (
        <div className="overflow-x-auto max-h-56 rounded-lg border border-gray-800 bg-[#090e1a]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0f172a] text-gray-400 border-b border-gray-800">
              <tr>
                <th className="py-2 px-2.5">Line</th>
                <th className="py-2 px-2.5">LOCCTR</th>
                <th className="py-2 px-2.5">Statement</th>
                <th className="py-2 px-2.5 text-right">Object Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {(!intermediateLines || intermediateLines.length === 0) ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No assembler data available.
                  </td>
                </tr>
              ) : (
                intermediateLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 text-gray-300">
                    <td className="py-1.5 px-2.5 text-gray-500">{line.lineNumber || idx + 1}</td>
                    <td className="py-1.5 px-2.5 text-cyan-400 font-bold">0x{line.address}</td>
                    <td className="py-1.5 px-2.5 font-bold text-gray-200">{line.rawLine}</td>
                    <td className="py-1.5 px-2.5 text-right text-amber-300 font-bold">{line.objectCode || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
