import React, { useState } from 'react';
import { Tag, FileText } from 'lucide-react';

export default function SymbolAndLocctrTable({ symtab, intermediateLines }) {
  const [activeTab, setActiveTab] = useState('symtab');

  return (
    <div className="brutalist-card bg-white p-4 h-full flex flex-col justify-between border-3 border-black shadow-[6px_6px_0px_0px_#000]">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b-3 border-black pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('symtab')}
            className={`brutalist-btn text-xs py-1 px-3 ${
              activeTab === 'symtab' ? 'brutalist-btn-yellow' : 'brutalist-btn-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            Symbol Table (SYMTAB)
          </button>

          <button
            onClick={() => setActiveTab('locctr')}
            className={`brutalist-btn text-xs py-1 px-3 ${
              activeTab === 'locctr' ? 'brutalist-btn-cyan' : 'brutalist-btn-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            LOCCTR Assembler View
          </button>
        </div>
      </div>

      {/* SYMTAB View */}
      {activeTab === 'symtab' && (
        <div className="overflow-x-auto max-h-56 border-3 border-black shadow-[3px_3px_0px_0px_#000]">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Symbol Name</th>
                <th style={{ textAlign: 'right' }}>Hex Address</th>
              </tr>
            </thead>
            <tbody>
              {(!symtab || symtab.length === 0) ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '1rem' }}>
                    No symbols found.
                  </td>
                </tr>
              ) : (
                symtab.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'highlight' : ''}>
                    <td className="font-extrabold">{item.symbol}</td>
                    <td style={{ textAlign: 'right' }} className="font-black">0x{item.address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* LOCCTR Assembler View */}
      {activeTab === 'locctr' && (
        <div className="overflow-x-auto max-h-56 border-3 border-black shadow-[3px_3px_0px_0px_#000]">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Line</th>
                <th>LOCCTR</th>
                <th>Statement</th>
                <th style={{ textAlign: 'right' }}>Object Code</th>
              </tr>
            </thead>
            <tbody>
              {(!intermediateLines || intermediateLines.length === 0) ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                    No assembler data available.
                  </td>
                </tr>
              ) : (
                intermediateLines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="font-bold">{line.lineNumber || idx + 1}</td>
                    <td className="font-black">0x{line.address}</td>
                    <td className="font-bold">{line.rawLine}</td>
                    <td style={{ textAlign: 'right' }} className="font-black">{line.objectCode || '-'}</td>
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
