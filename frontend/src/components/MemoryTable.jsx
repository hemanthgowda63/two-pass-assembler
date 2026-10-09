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
    <div className="brutalist-card bg-white p-4 h-full flex flex-col justify-between border-3 border-black shadow-[6px_6px_0px_0px_#000]">
      <div className="flex items-center justify-between mb-3 border-b-3 border-black pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-black" />
          <h2 className="text-sm font-black tracking-wide text-black uppercase">
            Memory Table
          </h2>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-black" />
          <input
            type="text"
            placeholder="Filter memory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1 text-xs font-mono font-bold bg-yellow-200 border-2 border-black text-black outline-none shadow-[2px_2px_0px_0px_#000]"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-64 border-3 border-black shadow-[3px_3px_0px_0px_#000]">
        <table className="brutalist-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Label</th>
              <th>Type</th>
              <th>Object Code</th>
              <th style={{ textAlign: 'right' }}>Value (Dec)</th>
              <th style={{ textAlign: 'right' }}>Value (Hex)</th>
            </tr>
          </thead>
          <tbody>
            {filteredMemory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  No memory entries found.
                </td>
              </tr>
            ) : (
              filteredMemory.map((item, idx) => {
                const isModified = modifiedAddrs.has(item.address);
                return (
                  <tr
                    key={idx}
                    className={isModified ? 'modified' : item.label ? 'highlight' : ''}
                  >
                    <td className="font-bold">0x{item.address}</td>
                    <td className="font-extrabold">{item.label || '-'}</td>
                    <td>{item.opcode || 'WORD'}</td>
                    <td>{item.objectCode || '-'}</td>
                    <td style={{ textAlign: 'right' }} className="font-black">{item.valueDec}</td>
                    <td style={{ textAlign: 'right' }} className="font-black">0x{item.valueHex}</td>
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
