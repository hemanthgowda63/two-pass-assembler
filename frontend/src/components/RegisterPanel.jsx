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
      valHex: currentRegs.A_HEX || '000000',
      valDec: currentRegs.A_DEC || '0',
      prevHex: prevRegs.A_HEX,
      isChanged: prevRegs.A_HEX !== currentRegs.A_HEX
    },
    {
      key: 'X',
      name: 'Index Register (X)',
      valHex: currentRegs.X_HEX || '000000',
      valDec: currentRegs.X_DEC || '0',
      prevHex: prevRegs.X_HEX,
      isChanged: prevRegs.X_HEX !== currentRegs.X_HEX
    },
    {
      key: 'L',
      name: 'Linkage Register (L)',
      valHex: currentRegs.L_HEX || '0000',
      valDec: null,
      prevHex: prevRegs.L_HEX,
      isChanged: prevRegs.L_HEX !== currentRegs.L_HEX
    },
    {
      key: 'PC',
      name: 'Program Counter (PC)',
      valHex: currentRegs.PC_HEX || '3000',
      valDec: null,
      prevHex: prevRegs.PC_HEX,
      isChanged: prevRegs.PC_HEX !== currentRegs.PC_HEX
    },
    {
      key: 'SW',
      name: 'Status Word (SW)',
      valHex: currentRegs.SW || '=',
      valDec: null,
      prevHex: prevRegs.SW,
      isChanged: prevRegs.SW !== currentRegs.SW
    }
  ];

  return (
    <div className="brutalist-card bg-white flex flex-col justify-between border-3 border-black shadow-[6px_6px_0px_0px_#000]">
      <div className="flex items-center gap-2 mb-3 border-b-3 border-black pb-2">
        <Cpu className="w-5 h-5 text-black" />
        <h2 className="text-sm font-black tracking-wide text-black uppercase">
          CPU Registers
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {registers.map((reg) => (
          <div
            key={reg.key}
            className={`register-card ${reg.isChanged ? 'changed' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="register-title font-extrabold">{reg.name}</span>
              <span className="brutalist-badge brutalist-badge-white text-[10px]">
                Reg {reg.key}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="register-val">
                0x{reg.valHex}
                {reg.valDec !== null && (
                  <span className="text-xs font-bold text-stone-700 ml-2">
                    ({reg.valDec})
                  </span>
                )}
              </div>

              {reg.isChanged && (
                <div className="flex items-center text-xs font-mono font-black text-black bg-white px-1.5 py-0.5 border-2 border-black gap-1">
                  <span>0x{reg.prevHex}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>0x{reg.valHex}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
