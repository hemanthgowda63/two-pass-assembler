import java.util.*;

public class Simulator {

    private final byte[] memory = new byte[65536];
    private int registerA = 0;
    private int registerX = 0;
    private int registerL = 0;
    private int pc = 0;
    private char registerSW = '='; // '<', '=', '>'

    private int startAddress;
    private int programLength;

    private Map<String, Symbol> symtab;
    private Map<Integer, String> addressToSymbolMap = new HashMap<>();
    private Map<Integer, IntermediateLine> addressToLineMap = new HashMap<>();
    private List<ExecutionStep> stepHistory = new ArrayList<>();

    public Simulator(int startAddress, int programLength, Map<String, Symbol> symtab, List<IntermediateLine> intermediateLines) {
        this.startAddress = startAddress;
        this.programLength = programLength;
        this.symtab = symtab != null ? symtab : new HashMap<>();

        for (Symbol sym : this.symtab.values()) {
            try {
                int addr = Integer.parseInt(sym.getAddress(), 16);
                addressToSymbolMap.put(addr, sym.getName());
            } catch (Exception ignored) {}
        }

        // Initialize Memory to 0
        Arrays.fill(memory, (byte) 0);

        // Load instructions and directives into memory
        for (IntermediateLine line : intermediateLines) {
            int addr = line.getAddress();
            addressToLineMap.put(addr, line);

            String objCode = line.getObjectCode();
            if (objCode != null && !objCode.isEmpty()) {
                loadObjectCodeIntoMemory(addr, objCode);
            }
        }
    }

    private void loadObjectCodeIntoMemory(int startAddr, String hexCode) {
        hexCode = hexCode.trim();
        for (int i = 0; i < hexCode.length(); i += 2) {
            if (i + 2 <= hexCode.length()) {
                String byteHex = hexCode.substring(i, i + 2);
                int b = Integer.parseInt(byteHex, 16);
                if (startAddr + (i / 2) < memory.length) {
                    memory[startAddr + (i / 2)] = (byte) b;
                }
            }
        }
    }

    public int readWord(int addr) {
        if (addr < 0 || addr + 2 >= memory.length) return 0;
        int b1 = memory[addr] & 0xFF;
        int b2 = memory[addr + 1] & 0xFF;
        int b3 = memory[addr + 2] & 0xFF;
        int val = (b1 << 16) | (b2 << 8) | b3;
        // Sign extend 24-bit to 32-bit signed int
        if ((val & 0x800000) != 0) {
            val |= 0xFF000000;
        }
        return val;
    }

    public void writeWord(int addr, int val) {
        if (addr < 0 || addr + 2 >= memory.length) return;
        memory[addr] = (byte) ((val >> 16) & 0xFF);
        memory[addr + 1] = (byte) ((val >> 8) & 0xFF);
        memory[addr + 2] = (byte) (val & 0xFF);
    }

    public int readByte(int addr) {
        if (addr < 0 || addr >= memory.length) return 0;
        return memory[addr] & 0xFF;
    }

    public void writeByte(int addr, int val) {
        if (addr < 0 || addr >= memory.length) return;
        memory[addr] = (byte) (val & 0xFF);
    }

    public List<ExecutionStep> execute() throws AssemblyException {
        stepHistory.clear();
        pc = startAddress;
        registerA = 0;
        registerX = 0;
        registerL = 0;
        registerSW = '=';

        int stepCount = 0;
        int maxSteps = 500; // Safety cap against infinite loops
        int callDepth = 0;
        String currentSubroutine = "MAIN";

        // Stack to track subroutine names for JSUB/RSUB
        Stack<String> subroutineStack = new Stack<>();
        subroutineStack.push("MAIN");

        while (stepCount < maxSteps) {
            stepCount++;
            int currentPC = pc;

            // Retrieve line details at current PC if available
            IntermediateLine lineInfo = addressToLineMap.get(currentPC);

            // Fetch 3-byte instruction from memory
            int b0 = readByte(currentPC);
            int b1 = readByte(currentPC + 1);
            int b2 = readByte(currentPC + 2);

            String opcodeMnemonic = getMnemonicForOpcodeHex(b0);

            // If instruction not found in source line map or opcode is 0 with no line, terminate
            if (lineInfo == null && opcodeMnemonic.equals("UNKNOWN")) {
                break;
            }

            int operandRawAddr = ((b1 & 0x7F) << 8) | b2;
            boolean isIndexed = (b1 & 0x80) != 0;
            int targetAddress = isIndexed ? (operandRawAddr + registerX) : operandRawAddr;

            String label = lineInfo != null ? lineInfo.getLabel() : "";
            String opcode = lineInfo != null ? lineInfo.getOpcode() : opcodeMnemonic;
            String operand = lineInfo != null ? lineInfo.getOperand() : String.format("%04X", targetAddress);
            String rawLine = lineInfo != null ? lineInfo.getRawLine() : (opcode + " " + operand);
            String objectCode = lineInfo != null ? lineInfo.getObjectCode() : String.format("%02X%02X%02X", b0, b1, b2);
            int lineNumber = lineInfo != null ? lineInfo.getLineNumber() : stepCount;

            // Before state
            Map<String, String> regBefore = captureRegisters(currentPC);
            List<ExecutionStep.MemoryChange> memoryChanges = new ArrayList<>();

            // Increment PC to next instruction by default
            pc = currentPC + 3;

            String explanation = "";
            String formula = "";
            boolean terminateExecution = false;

            // Lookup symbol name for target address if applicable
            String targetSymbol = addressToSymbolMap.getOrDefault(targetAddress, operand);
            if (targetSymbol.isEmpty()) targetSymbol = String.format("%04X", targetAddress);

            switch (opcode.toUpperCase()) {
                case "LDA":
                    int ldaVal = readWord(targetAddress);
                    registerA = ldaVal;
                    formula = "A <- MEM[" + targetSymbol + "]";
                    explanation = String.format("Load value %d (0x%06X) stored at %s (address %04X) into accumulator register A.", ldaVal, ldaVal & 0xFFFFFF, targetSymbol, targetAddress);
                    break;

                case "LDX":
                    int ldxVal = readWord(targetAddress);
                    registerX = ldxVal;
                    formula = "X <- MEM[" + targetSymbol + "]";
                    explanation = String.format("Load value %d stored at %s (address %04X) into index register X.", ldxVal, targetSymbol, targetAddress);
                    break;

                case "LDL":
                    int ldlVal = readWord(targetAddress);
                    registerL = ldlVal;
                    formula = "L <- MEM[" + targetSymbol + "]";
                    explanation = String.format("Load return address %04X stored at %s into linkage register L.", ldlVal, targetSymbol);
                    break;

                case "STA":
                    int oldMemVal = readWord(targetAddress);
                    writeWord(targetAddress, registerA);
                    int newMemVal = readWord(targetAddress);
                    memoryChanges.add(new ExecutionStep.MemoryChange(targetAddress, targetSymbol, oldMemVal, newMemVal));
                    formula = "MEM[" + targetSymbol + "] <- A";
                    explanation = String.format("Store value %d (0x%06X) from accumulator register A into memory location %s (address %04X).", registerA, registerA & 0xFFFFFF, targetSymbol, targetAddress);
                    break;

                case "STX":
                    int oldXMem = readWord(targetAddress);
                    writeWord(targetAddress, registerX);
                    memoryChanges.add(new ExecutionStep.MemoryChange(targetAddress, targetSymbol, oldXMem, registerX));
                    formula = "MEM[" + targetSymbol + "] <- X";
                    explanation = String.format("Store index register X (%d) into memory location %s.", registerX, targetSymbol);
                    break;

                case "STL":
                    int oldLMem = readWord(targetAddress);
                    writeWord(targetAddress, registerL);
                    memoryChanges.add(new ExecutionStep.MemoryChange(targetAddress, targetSymbol, oldLMem, registerL));
                    formula = "MEM[" + targetSymbol + "] <- L";
                    explanation = String.format("Store linkage register L (%04X) into memory location %s.", registerL, targetSymbol);
                    break;

                case "ADD":
                    int addVal = readWord(targetAddress);
                    int prevA = registerA;
                    registerA += addVal;
                    formula = String.format("A <- %d + %d = %d", prevA, addVal, registerA);
                    explanation = String.format("Add value %d stored at %s to accumulator A (%d + %d = %d).", addVal, targetSymbol, prevA, addVal, registerA);
                    break;

                case "SUB":
                    int subVal = readWord(targetAddress);
                    int pA = registerA;
                    registerA -= subVal;
                    formula = String.format("A <- %d - %d = %d", pA, subVal, registerA);
                    explanation = String.format("Subtract value %d stored at %s from register A.", subVal, targetSymbol);
                    break;

                case "MUL":
                    int mulVal = readWord(targetAddress);
                    registerA *= mulVal;
                    formula = "A <- A * MEM[" + targetSymbol + "]";
                    explanation = String.format("Multiply register A by value %d at %s.", mulVal, targetSymbol);
                    break;

                case "DIV":
                    int divVal = readWord(targetAddress);
                    if (divVal == 0) throw new AssemblyException("Division by zero at address " + String.format("%04X", currentPC));
                    registerA /= divVal;
                    formula = "A <- A / MEM[" + targetSymbol + "]";
                    explanation = String.format("Divide register A by value %d at %s.", divVal, targetSymbol);
                    break;

                case "COMP":
                    int compVal = readWord(targetAddress);
                    if (registerA < compVal) registerSW = '<';
                    else if (registerA == compVal) registerSW = '=';
                    else registerSW = '>';
                    formula = String.format("SW <- Compare(A: %d, MEM: %d)", registerA, compVal);
                    explanation = String.format("Compare accumulator A (%d) with value %d at %s. Status Word SW set to '%c'.", registerA, compVal, targetSymbol, registerSW);
                    break;

                case "JSUB":
                    int returnAddr = pc;
                    registerL = returnAddr;
                    pc = targetAddress;
                    callDepth++;
                    currentSubroutine = operand.isEmpty() ? String.format("%04X", targetAddress) : operand;
                    subroutineStack.push(currentSubroutine);
                    formula = String.format("L <- %04X, PC <- %04X", returnAddr, targetAddress);
                    explanation = String.format("Call subroutine %s at address %04X. Saved return address %04X into register L.", currentSubroutine, targetAddress, returnAddr);
                    break;

                case "RSUB":
                    int nextPC = registerL;
                    formula = String.format("PC <- L (%04X)", nextPC);
                    if (callDepth > 0) {
                        callDepth--;
                        if (!subroutineStack.isEmpty()) subroutineStack.pop();
                        currentSubroutine = subroutineStack.peek();
                        explanation = String.format("Return from subroutine to saved address %04X in register L.", nextPC);
                        pc = nextPC;
                    } else {
                        explanation = "Return from main subroutine (program completed).";
                        pc = nextPC;
                        terminateExecution = true;
                    }
                    break;

                case "J":
                    pc = targetAddress;
                    formula = String.format("PC <- %04X", targetAddress);
                    explanation = String.format("Unconditional jump to address %04X (%s).", targetAddress, targetSymbol);
                    break;

                case "JEQ":
                    formula = "If SW == '=' then PC <- " + String.format("%04X", targetAddress);
                    if (registerSW == '=') {
                        pc = targetAddress;
                        explanation = String.format("Condition '=' matched. Jumped to address %04X.", targetAddress);
                    } else {
                        explanation = String.format("Condition '=' not matched (SW is '%c'). Next instruction at %04X.", registerSW, pc);
                    }
                    break;

                case "JGT":
                    formula = "If SW == '>' then PC <- " + String.format("%04X", targetAddress);
                    if (registerSW == '>') {
                        pc = targetAddress;
                        explanation = String.format("Condition '>' matched. Jumped to address %04X.", targetAddress);
                    } else {
                        explanation = String.format("Condition '>' not matched (SW is '%c'). Next instruction at %04X.", registerSW, pc);
                    }
                    break;

                case "JLT":
                    formula = "If SW == '<' then PC <- " + String.format("%04X", targetAddress);
                    if (registerSW == '<') {
                        pc = targetAddress;
                        explanation = String.format("Condition '<' matched. Jumped to address %04X.", targetAddress);
                    } else {
                        explanation = String.format("Condition '<' not matched (SW is '%c'). Next instruction at %04X.", registerSW, pc);
                    }
                    break;

                default:
                    explanation = "Execute instruction " + opcode + " " + operand;
                    formula = opcode + " " + operand;
                    break;
            }

            Map<String, String> regAfter = captureRegisters(pc);

            ExecutionStep step = new ExecutionStep(
                    stepCount,
                    lineNumber,
                    currentPC,
                    label,
                    opcode,
                    operand,
                    rawLine,
                    objectCode,
                    explanation,
                    formula,
                    regBefore,
                    regAfter,
                    memoryChanges,
                    callDepth,
                    currentSubroutine,
                    terminateExecution
            );

            stepHistory.add(step);

            if (terminateExecution) {
                break;
            }
        }

        return stepHistory;
    }

    private Map<String, String> captureRegisters(int currentPC) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("A", String.format("%d (0x%06X)", registerA, registerA & 0xFFFFFF));
        map.put("A_DEC", String.valueOf(registerA));
        map.put("A_HEX", String.format("%06X", registerA & 0xFFFFFF));

        map.put("X", String.format("%d (0x%06X)", registerX, registerX & 0xFFFFFF));
        map.put("X_DEC", String.valueOf(registerX));
        map.put("X_HEX", String.format("%06X", registerX & 0xFFFFFF));

        map.put("L", String.format("%04X", registerL & 0xFFFF));
        map.put("L_HEX", String.format("%04X", registerL & 0xFFFF));

        map.put("PC", String.format("%04X", currentPC & 0xFFFF));
        map.put("PC_HEX", String.format("%04X", currentPC & 0xFFFF));

        map.put("SW", String.valueOf(registerSW));
        return map;
    }

    private String getMnemonicForOpcodeHex(int byte0) {
        int op = byte0 & 0xFC;
        String hex = String.format("%02X", op);
        for (Map.Entry<String, String> entry : OpcodeTable.getOptab().entrySet()) {
            if (entry.getValue().equalsIgnoreCase(hex)) {
                return entry.getKey();
            }
        }
        return "UNKNOWN";
    }

    public byte[] getMemorySnapshot() {
        return memory.clone();
    }

    public List<ExecutionStep> getStepHistory() {
        return stepHistory;
    }
}
