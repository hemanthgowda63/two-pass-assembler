// Standalone 24-bit Standard SIC Assembler & CPU Simulator Engine in JavaScript

const OPTAB = {
  LDA: '00', LDX: '04', LDL: '08', STA: '0C', STX: '10', STL: '14',
  ADD: '18', SUB: '1C', MUL: '20', DIV: '24', COMP: '28', TIX: '2C',
  JEQ: '30', JGT: '34', JLT: '38', J: '3C', AND: '40', OR: '44',
  JSUB: '48', RSUB: '4C', LDCH: '50', STCH: '54', RD: 'D8', WD: 'DC',
  TD: 'E0', STSW: 'E8'
};

export function assembleAndSimulate(sourceCode) {
  const lines = sourceCode.split('\n');
  let locctr = 0x3000;
  let startAddress = 0x3000;
  let programName = 'MAIN';

  const symtab = {};
  const intermediate = [];
  const errors = [];

  // Pass 1
  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('.')) return;

    const parts = trimmed.split(/\s+/);
    let label = '';
    let opcode = '';
    let operand = '';

    if (OPTAB[parts[0].toUpperCase()] || ['START', 'END', 'WORD', 'RESW', 'RESB', 'BYTE', 'LTORG'].includes(parts[0].toUpperCase())) {
      opcode = parts[0].toUpperCase();
      operand = parts[1] || '';
    } else {
      label = parts[0];
      opcode = (parts[1] || '').toUpperCase();
      operand = parts[2] || '';
    }

    if (opcode === 'START') {
      startAddress = parseInt(operand, 16) || 0x3000;
      locctr = startAddress;
      programName = label || 'MAIN';
      if (label) symtab[label] = String(locctr.toString(16).toUpperCase()).padStart(4, '0');
      intermediate.push({ lineNumber: lineNum, address: locctr, label, opcode, operand, rawLine: trimmed, objectCode: '' });
      return;
    }

    if (label) {
      if (symtab[label]) {
        errors.push({ line: lineNum, message: `Duplicate symbol: ${label}` });
      } else {
        symtab[label] = String(locctr.toString(16).toUpperCase()).padStart(4, '0');
      }
    }

    const item = { lineNumber: lineNum, address: locctr, label, opcode, operand, rawLine: trimmed, objectCode: '' };
    intermediate.push(item);

    if (OPTAB[opcode] || opcode === 'WORD') locctr += 3;
    else if (opcode === 'RESW') locctr += 3 * (parseInt(operand) || 1);
    else if (opcode === 'RESB') locctr += parseInt(operand) || 1;
    else if (opcode === 'BYTE') {
      if (operand.toUpperCase().startsWith("C'")) locctr += operand.substring(2, operand.length - 1).length;
      else if (operand.toUpperCase().startsWith("X'")) locctr += Math.ceil(operand.substring(2, operand.length - 1).length / 2);
    }
  });

  if (errors.length > 0) {
    return { success: false, errorMessage: errors[0].message, errorLine: errors[0].line };
  }

  // Pass 2: Object code generation
  intermediate.forEach((item) => {
    const { opcode, operand } = item;
    if (OPTAB[opcode]) {
      const opHex = OPTAB[opcode];
      let targetAddr = 0;
      let targetSym = operand;
      let isIndexed = false;

      if (operand.toUpperCase().endsWith(',X')) {
        isIndexed = true;
        targetSym = operand.substring(0, operand.length - 2).trim();
      }

      if (symtab[targetSym]) {
        targetAddr = parseInt(symtab[targetSym], 16);
      } else if (targetSym) {
        targetAddr = parseInt(targetSym, 16) || 0;
      }

      if (isIndexed) targetAddr |= 0x8000;
      item.objectCode = opHex + String(targetAddr.toString(16).toUpperCase()).padStart(4, '0');
    } else if (opcode === 'WORD') {
      const val = parseInt(operand) || 0;
      item.objectCode = String((val & 0xffffff).toString(16).toUpperCase()).padStart(6, '0');
    }
  });

  // Simulator
  const memory = new Uint8Array(65536);
  const writeWord = (addr, val) => {
    memory[addr] = (val >> 16) & 0xff;
    memory[addr + 1] = (val >> 8) & 0xff;
    memory[addr + 2] = val & 0xff;
  };

  const readWord = (addr) => {
    const b1 = memory[addr];
    const b2 = memory[addr + 1];
    const b3 = memory[addr + 2];
    let val = (b1 << 16) | (b2 << 8) | b3;
    if (val & 0x800000) val |= 0xff000000;
    return val;
  };

  // Load into memory
  intermediate.forEach((item) => {
    if (item.objectCode) {
      const code = item.objectCode;
      for (let i = 0; i < code.length; i += 2) {
        memory[item.address + i / 2] = parseInt(code.substring(i, i + 2), 16);
      }
    }
  });

  // Step Execution Simulation
  let regA = 0;
  let regX = 0;
  let regL = 0;
  let pc = startAddress;
  let regSW = '=';

  const executionTrace = [];
  const addrToLineMap = {};
  intermediate.forEach((l) => (addrToLineMap[l.address] = l));

  let stepCount = 0;
  let callDepth = 0;
  let currentSubroutine = 'MAIN';
  const subStack = ['MAIN'];

  while (stepCount < 100) {
    stepCount++;
    const currentPC = pc;
    const lineInfo = addrToLineMap[currentPC];
    if (!lineInfo && stepCount > 1) break;

    const b0 = memory[currentPC];
    const b1 = memory[currentPC + 1];
    const b2 = memory[currentPC + 2];
    const targetAddr = ((b1 & 0x7f) << 8) | b2;

    const label = lineInfo ? lineInfo.label : '';
    const opcode = lineInfo ? lineInfo.opcode : 'UNKNOWN';
    const operand = lineInfo ? lineInfo.operand : '';
    const rawLine = lineInfo ? lineInfo.rawLine : `${opcode} ${operand}`;
    const objectCode = lineInfo ? lineInfo.objectCode : '';
    const lineNumber = lineInfo ? lineInfo.lineNumber : stepCount;

    const regBefore = {
      A_DEC: String(regA), A_HEX: String((regA & 0xffffff).toString(16).toUpperCase()).padStart(6, '0'),
      X_DEC: String(regX), X_HEX: String((regX & 0xffffff).toString(16).toUpperCase()).padStart(6, '0'),
      L_HEX: String(regL.toString(16).toUpperCase()).padStart(4, '0'),
      PC_HEX: String(currentPC.toString(16).toUpperCase()).padStart(4, '0'),
      SW: regSW
    };

    const memoryChanges = [];
    pc = currentPC + 3;
    let explanation = '';
    let formula = '';
    let isFinished = false;

    const targetSymbol = Object.keys(symtab).find((k) => parseInt(symtab[k], 16) === targetAddr) || operand || targetAddr.toString(16);

    switch (opcode) {
      case 'LDA': {
        const val = readWord(targetAddr);
        regA = val;
        formula = `A <- MEM[${targetSymbol}]`;
        explanation = `Load value ${val} stored at ${targetSymbol} (address 0x${targetAddr.toString(16).toUpperCase()}) into register A.`;
        break;
      }
      case 'ADD': {
        const val = readWord(targetAddr);
        const prevA = regA;
        regA += val;
        formula = `A <- ${prevA} + ${val} = ${regA}`;
        explanation = `Add value ${val} stored at ${targetSymbol} to accumulator A (${prevA} + ${val} = ${regA}).`;
        break;
      }
      case 'STA': {
        const oldVal = readWord(targetAddr);
        writeWord(targetAddr, regA);
        memoryChanges.push({ address: targetAddr.toString(16).toUpperCase(), label: targetSymbol, oldValue: oldVal, newValue: regA });
        formula = `MEM[${targetSymbol}] <- A`;
        explanation = `Store value ${regA} from accumulator register A into memory location ${targetSymbol}.`;
        break;
      }
      case 'JSUB': {
        regL = pc;
        pc = targetAddr;
        callDepth++;
        currentSubroutine = operand || targetAddr.toString(16);
        subStack.push(currentSubroutine);
        formula = `L <- 0x${regL.toString(16).toUpperCase()}, PC <- 0x${targetAddr.toString(16).toUpperCase()}`;
        explanation = `Call subroutine ${currentSubroutine} at address 0x${targetAddr.toString(16).toUpperCase()}, saving return address into register L.`;
        break;
      }
      case 'RSUB': {
        if (callDepth > 0) {
          callDepth--;
          subStack.pop();
          currentSubroutine = subStack[subStack.length - 1];
          explanation = `Return from subroutine to address saved in register L (0x${regL.toString(16).toUpperCase()}).`;
          pc = regL;
        } else {
          explanation = 'Return from main program (execution complete).';
          isFinished = true;
        }
        break;
      }
      default:
        explanation = `Execute ${opcode} ${operand}`;
        formula = `${opcode} ${operand}`;
    }

    const regAfter = {
      A_DEC: String(regA), A_HEX: String((regA & 0xffffff).toString(16).toUpperCase()).padStart(6, '0'),
      X_DEC: String(regX), X_HEX: String((regX & 0xffffff).toString(16).toUpperCase()).padStart(6, '0'),
      L_HEX: String(regL.toString(16).toUpperCase()).padStart(4, '0'),
      PC_HEX: String(pc.toString(16).toUpperCase()).padStart(4, '0'),
      SW: regSW
    };

    executionTrace.push({
      stepNumber: stepCount,
      lineNumber,
      address: currentPC.toString(16).toUpperCase(),
      label,
      opcode,
      operand,
      rawLine,
      objectCode,
      explanation,
      operationFormula: formula,
      registersBefore: regBefore,
      registersAfter: regAfter,
      memoryChanges,
      callDepth,
      currentSubroutine,
      isFinished
    });

    if (isFinished) break;
  }

  // Memory Snapshot
  const memorySnapshot = intermediate.map((item) => ({
    address: item.address.toString(16).toUpperCase(),
    label: item.label,
    opcode: item.opcode,
    valueDec: readWord(item.address),
    valueHex: String((readWord(item.address) & 0xffffff).toString(16).toUpperCase()).padStart(6, '0'),
    objectCode: item.objectCode
  }));

  const symtabList = Object.keys(symtab).map((k) => ({ symbol: k, address: symtab[k] }));

  return {
    success: true,
    programName,
    startAddress: startAddress.toString(16).toUpperCase(),
    symtab: symtabList,
    intermediate: intermediate.map((i) => ({ ...i, address: i.address.toString(16).toUpperCase() })),
    executionTrace,
    memorySnapshot
  };
}
