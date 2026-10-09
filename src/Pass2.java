import java.util.*;

public class Pass2 {

    private String programName = "";
    private Map<String, Symbol> symtab;
    private List<Literal> littab;
    private List<String> intermediate;
    private List<IntermediateLine> intermediateLines;

    private List<String> objectCodes = new ArrayList<>();
    private List<String> pass2Details = new ArrayList<>();
    private List<String> literalPoolDetails = new ArrayList<>();

    private int startAddress;
    private int programLength;
    private String endOperand = "";

    public Pass2(
            String programName,
            Map<String, Symbol> symtab,
            List<Literal> littab,
            List<String> intermediate,
            int startAddress,
            int programLength) {

        this.programName = programName;
        this.symtab = symtab;
        this.littab = littab;
        this.intermediate = intermediate;
        this.intermediateLines = new ArrayList<>();
        this.startAddress = startAddress;
        this.programLength = programLength;
    }

    public Pass2(
            String programName,
            Map<String, Symbol> symtab,
            List<Literal> littab,
            List<IntermediateLine> intermediateLines,
            int startAddress,
            int programLength,
            boolean isStructured) {

        this.programName = programName;
        this.symtab = symtab;
        this.littab = littab;
        this.intermediateLines = intermediateLines;
        this.intermediate = new ArrayList<>();
        for (IntermediateLine line : intermediateLines) {
            this.intermediate.add(line.toString());
        }
        this.startAddress = startAddress;
        this.programLength = programLength;
    }

    public Pass2(
            Map<String, Symbol> symtab,
            List<Literal> littab,
            List<String> intermediate,
            int startAddress,
            int programLength) {

        this("", symtab, littab, intermediate, startAddress, programLength);
        if (!symtab.isEmpty()) {
            this.programName = symtab.values().iterator().next().getName();
        }
    }

    private boolean isDirective(String s) {
        String u = s.toUpperCase();
        return u.equals("START") || u.equals("END") || u.equals("WORD")
                || u.equals("RESW") || u.equals("RESB") || u.equals("BYTE")
                || u.equals("LTORG");
    }

    public void run() throws AssemblyException {
        objectCodes.clear();
        pass2Details.clear();
        literalPoolDetails.clear();

        Set<String> processedLiterals = new HashSet<>();

        int lineIdx = 0;
        for (String line : intermediate) {
            IntermediateLine structLine = (lineIdx < intermediateLines.size()) ? intermediateLines.get(lineIdx) : null;
            lineIdx++;

            String[] parts = line.split("\\s+");

            if (parts.length < 2) {
                continue;
            }

            String address = parts[0];

            // Literal line from intermediate file (* =X'05')
            if (parts[1].equals("*")) {
                String litName = parts.length > 2 ? parts[2] : "";

                for (Literal literal : littab) {
                    if (literal.getLiteral().equals(litName) && !processedLiterals.contains(litName)) {
                        processedLiterals.add(litName);
                        objectCodes.add(address + "\t" + literal.getValue());
                        literalPoolDetails.add(address + "\t" + litName + "\t" + literal.getValue());
                        if (structLine != null) {
                            structLine.setObjectCode(literal.getValue());
                        }
                        break;
                    }
                }
                continue;
            }

            String label = "";
            String opcode;
            String operand = "";

            if (OpcodeTable.contains(parts[1]) || isDirective(parts[1])) {
                opcode = parts[1].toUpperCase();
                if (parts.length > 2) {
                    operand = parts[2];
                }
            } else {
                label = parts[1];
                opcode = parts.length > 2 ? parts[2].toUpperCase() : "";
                if (parts.length > 3) {
                    operand = parts[3];
                }
            }

            if (opcode.equals("START")) {
                if (programName == null || programName.isEmpty()) {
                    programName = label;
                }
                continue;
            }

            if (opcode.equals("END")) {
                endOperand = operand;
                continue;
            }

            // MACHINE INSTRUCTION
            if (OpcodeTable.contains(opcode)) {
                String machineOpcode = OpcodeTable.getOpcode(opcode);
                int operandAddressInt = 0;
                boolean isIndexed = false;

                String targetSymbol = operand;
                if (operand.toUpperCase().endsWith(",X")) {
                    isIndexed = true;
                    targetSymbol = operand.substring(0, operand.length() - 2).trim();
                }

                if (!operand.isEmpty()) {
                    // Literal operand
                    if (targetSymbol.startsWith("=")) {
                        boolean found = false;
                        for (Literal literal : littab) {
                            if (literal.getLiteral().equals(targetSymbol)) {
                                operandAddressInt = Integer.parseInt(literal.getAddress(), 16);
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            throw new AssemblyException("Undefined literal operand: " + targetSymbol);
                        }
                    }
                    // Symbol operand
                    else {
                        if (symtab.containsKey(targetSymbol)) {
                            operandAddressInt = Integer.parseInt(symtab.get(targetSymbol).getAddress(), 16);
                        } else if (!targetSymbol.isEmpty()) {
                            // Try numeric address if specified directly
                            try {
                                operandAddressInt = Integer.parseInt(targetSymbol, 16);
                            } catch (NumberFormatException e) {
                                throw new AssemblyException("Undefined symbol operand: " + targetSymbol);
                            }
                        }
                    }
                }

                if (isIndexed) {
                    operandAddressInt |= 0x8000;
                }

                String operandAddressHex = String.format("%04X", operandAddressInt & 0xFFFF);
                String objectCode = machineOpcode + operandAddressHex;

                objectCodes.add(address + "\t" + objectCode);
                if (structLine != null) {
                    structLine.setObjectCode(objectCode);
                }

                String instruction = (label.isEmpty() ? "" : label + " ")
                        + opcode
                        + (operand.isEmpty() ? "" : " " + operand);

                pass2Details.add(address + "\t" + instruction + "\t" + objectCode);
            }

            // WORD DIRECTIVE
            else if (opcode.equals("WORD")) {
                int val = 0;
                try {
                    val = Integer.parseInt(operand);
                } catch (NumberFormatException e) {
                    try {
                        val = Integer.parseInt(operand.replace("0x", "").replace("0X", ""), 16);
                    } catch (NumberFormatException ex) {
                        throw new AssemblyException("Invalid WORD integer constant: " + operand);
                    }
                }

                String objectCode = String.format("%06X", val & 0xFFFFFF);
                objectCodes.add(address + "\t" + objectCode);
                if (structLine != null) {
                    structLine.setObjectCode(objectCode);
                }

                String instruction = (label.isEmpty() ? "" : label + " ") + opcode + " " + operand;
                pass2Details.add(address + "\t" + instruction + "\t" + objectCode);
            }

            // BYTE DIRECTIVE
            else if (opcode.equals("BYTE")) {
                String hex = "";
                if (operand.toUpperCase().startsWith("C'")) {
                    String chars = operand.substring(2, operand.length() - 1);
                    StringBuilder sb = new StringBuilder();
                    for (char c : chars.toCharArray()) {
                        sb.append(String.format("%02X", (int) c));
                    }
                    hex = sb.toString();
                } else if (operand.toUpperCase().startsWith("X'")) {
                    hex = operand.substring(2, operand.length() - 1);
                    if (hex.length() % 2 != 0) {
                        hex = "0" + hex;
                    }
                }

                objectCodes.add(address + "\t" + hex);
                if (structLine != null) {
                    structLine.setObjectCode(hex);
                }

                String instruction = (label.isEmpty() ? "" : label + " ") + opcode + " " + operand;
                pass2Details.add(address + "\t" + instruction + "\t" + hex);
            }

            // RESW / RESB DIRECTIVES
            else if (opcode.equals("RESW") || opcode.equals("RESB")) {
                // Storage reservations generate no object code directly
            }
        }

        // LITERAL OBJECT CODE (FALLBACK)
        for (Literal literal : littab) {
            if (!processedLiterals.contains(literal.getLiteral())) {
                objectCodes.add(literal.getAddress() + "\t" + literal.getValue());
                literalPoolDetails.add(literal.getAddress() + "\t" + literal.getLiteral() + "\t" + literal.getValue());
            }
        }
    }

    public void displayObjectCode() {
        System.out.println("\n========== PASS 2 ==========\n");
        System.out.println("OBJECT CODE");
        System.out.println("------------------------------------------------");
        System.out.printf("%-10s %-18s %-12s%n", "Address", "Instruction", "Object Code");
        System.out.println("------------------------------------------------");

        for (String line : pass2Details) {
            String[] parts = line.split("\\t", -1);
            String addr = parts.length > 0 ? parts[0] : "";
            String instr = parts.length > 1 ? parts[1] : "";
            String obj = parts.length > 2 ? parts[2] : "";
            System.out.printf("%-10s %-18s %-12s%n", addr, instr, obj);
        }

        System.out.println("------------------------------------------------");
        System.out.println("\nLITERAL POOL");
        System.out.println("------------------------------------------------");

        for (String line : literalPoolDetails) {
            String[] parts = line.split("\\t", -1);
            String addr = parts.length > 0 ? parts[0] : "";
            String lit = parts.length > 1 ? parts[1] : "";
            String obj = parts.length > 2 ? parts[2] : "";
            System.out.printf("%-10s %-18s %-12s%n", addr, lit, obj);
        }
        System.out.println("------------------------------------------------");
    }

    public void generateObjectProgram() {
        System.out.println("\n========== OBJECT PROGRAM ==========\n");

        String header = String.format("H^%-6s^%06X^%06X", programName, startAddress, programLength);
        System.out.println(header);

        StringBuilder textObjectCode = new StringBuilder();
        int textStartAddress = -1;
        int textLength = 0;

        for (String entry : objectCodes) {
            String[] parts = entry.split("\\s+");
            int address = Integer.parseInt(parts[0], 16);
            String code = parts[1];
            int codeLength = code.length() / 2;

            if (textStartAddress == -1) {
                textStartAddress = address;
                textLength = 0;
                textObjectCode.setLength(0);
            }

            if (textLength + codeLength > 30) {
                printTextRecord(textStartAddress, textLength, textObjectCode.toString());
                textStartAddress = address;
                textLength = 0;
                textObjectCode.setLength(0);
            }

            if (textLength > 0) {
                int expectedAddress = textStartAddress + textLength;
                if (address != expectedAddress) {
                    printTextRecord(textStartAddress, textLength, textObjectCode.toString());
                    textStartAddress = address;
                    textLength = 0;
                    textObjectCode.setLength(0);
                }
            }

            if (textObjectCode.length() > 0) {
                textObjectCode.append("^");
            }
            textObjectCode.append(code);
            textLength += codeLength;
        }

        if (textLength > 0) {
            printTextRecord(textStartAddress, textLength, textObjectCode.toString());
        }

        int firstExecAddr = startAddress;
        if (!endOperand.isEmpty()) {
            if (symtab.containsKey(endOperand)) {
                firstExecAddr = Integer.parseInt(symtab.get(endOperand).getAddress(), 16);
            } else if (endOperand.equals(programName)) {
                firstExecAddr = startAddress;
            }
        }

        String end = String.format("E^%06X", firstExecAddr);
        System.out.println(end);
    }

    private void printTextRecord(int startAddress, int length, String objectCode) {
        System.out.printf("T^%06X^%02X^%s%n", startAddress, length, objectCode);
    }

    public List<String> getObjectCodes() { return objectCodes; }
    public List<String> getPass2Details() { return pass2Details; }
    public String getEndOperand() { return endOperand; }
}