import React from 'react';
import { Cpu, ArrowRight } from 'lucide-react';

export default function RegisterPanel({ currentStep, prevStep }) {
  const currentRegs = currentStep?.registersAfter || {
    A_DEC: '0', A_HEX: '000000',
    X_DEC: '0', X_HEX: '000000',
    L_HEX: '0000',
    PC_HEX: '3000',
    SW: '='
  };

  const prevRegs = prevStep?.registersAfter || currentRegs;

  const registers = [
    {
      key: 'A',
      name: 'Accumulator (A)',
      desc: 'Primary 24-bit arithmetic register',
      valHex: currentRegs.A_HEX || '000000',
      valDec: currentRegs.A_DEC || '0',
      prevHex: prevRegs.A_HEX,
      prevDec: prevRegs.A_DEC,
      isChanged: prevRegs.A_HEX !== currentRegs.A_HEX
    },
    {
      key: 'X',
      name: 'Index Register (X)',
      desc: 'Addressing & loop indexing register',
      valHex: currentRegs.X_HEX || '000000',
      valDec: currentRegs.X_DEC || '0',
      prevHex: prevRegs.X_HEX,
      prevDec: prevRegs.X_DEC,
      isChanged: prevRegs.X_HEX !== currentRegs.X_HEX
    },
    {
      key: 'L',
      name: 'Linkage Register (L)',
      desc: 'Subroutine return address storage',
      valHex: currentRegs.L_HEX || '0000',
      valDec: null,
      prevHex: prevRegs.L_HEX,
      prevDec: null,
      isChanged: prevRegs.L_HEX !== currentRegs.L_HEX
    },
    {
      key: 'PC',
      name: 'Program Counter (PC)',
      desc: 'Address of next executing instruction',
      valHex: currentRegs.PC_HEX || '3000',
      valDec: null,
      prevHex: prevRegs.PC_HEX,
      prevDec: null,
      isChanged: prevRegs.PC_HEX !== currentRegs.PC_HEX
    },
    {
      key: 'SW',
      name: 'Status Word (SW)',
      desc: 'Condition code (<, =, >)',
      valHex: currentRegs.SW || '=',
      valDec: null,
      prevHex: prevRegs.SW,
      prevDec: null,
      isChanged: prevRegs.SW !== currentRegs.SW
    }
  ];

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-bold tracking-wide text-gray-200 uppercase">
          CPU Registers
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {registers.map((reg) => (
          <div
            key={reg.key}
            className={`p-3 rounded-lg border transition-all duration-300 ${
              reg.isChanged
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-[#0f172a]/60 border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-300">{reg.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400">
                Reg {reg.key}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-mono text-lg font-bold text-cyan-300 tracking-wider">
                0x{reg.valHex}
                {reg.valDec !== null && (
                  <span className="text-xs text-gray-400 ml-2 font-normal">
                    ({reg.valDec})
                  </span>
                )}
              </div>

              {reg.isChanged && (
                <div className="flex items-center text-[10px] text-amber-400 font-mono gap-1">
                  <span>0x{reg.prevHex}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-bold">0x{reg.valHex}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{reg.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
