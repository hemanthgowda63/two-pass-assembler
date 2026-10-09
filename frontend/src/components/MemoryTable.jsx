import React, { useState } from 'react';
import { Database, Search } from 'lucide-react';

export default function MemoryTable({ memorySnapshot, currentStep }) {
  const [searchTerm, setSearchTerm] = useState('');

  const modifiedAddrs = new Set(
    (currentStep?.memoryChanges || []).map((mc) => mc.address)
  );

  const filteredMemory = (memorySnapshot || []).filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.address && item.address.toLowerCase().includes(term)) ||
      (item.label && item.label.toLowerCase().includes(term)) ||
      (item.opcode && item.opcode.toLowerCase().includes(term))
    );
  });

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold tracking-wide text-gray-200 uppercase">
            Memory Table
          </h2>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Filter memory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-2 py-1 text-xs bg-[#0a0f1d] border border-gray-800 rounded-md text-gray-300 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-64 rounded-lg border border-gray-800 bg-[#090e1a]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0f172a] text-gray-400 border-b border-gray-800 sticky top-0">
            <tr>
              <th className="py-2 px-3">Address</th>
              <th className="py-2 px-3">Label</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Object Code</th>
              <th className="py-2 px-3 text-right">Value (Dec)</th>
              <th className="py-2 px-3 text-right">Value (Hex)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredMemory.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 font-sans">
                  No memory entries found.
                </td>
              </tr>
            ) : (
              filteredMemory.map((item, idx) => {
                const isModified = modifiedAddrs.has(item.address);
                return (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-gray-800/40 ${
                      isModified
                        ? 'bg-emerald-950/50 text-emerald-200 font-bold border-l-2 border-emerald-400'
                        : item.label
                        ? 'bg-cyan-950/20 text-gray-200'
                        : 'text-gray-400'
                    }`}
                  >
                    <td className="py-1.5 px-3 font-bold text-cyan-400">
                      0x{item.address}
                    </td>
                    <td className="py-1.5 px-3 text-amber-300 font-semibold">
                      {item.label || '-'}
                    </td>
                    <td className="py-1.5 px-3 text-purple-300">
                      {item.opcode || 'WORD'}
                    </td>
                    <td className="py-1.5 px-3 text-gray-400">
                      {item.objectCode || '-'}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-gray-100">
                      {item.valueDec}
                    </td>
                    <td className="py-1.5 px-3 text-right text-emerald-400 font-bold">
                      0x{item.valueHex}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
