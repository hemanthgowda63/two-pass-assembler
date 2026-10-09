import java.util.*;
import java.io.*;

public class Pass1 {

    private String programName = "MAIN";
    private Map<String, Symbol> symtab = new LinkedHashMap<>();
    private List<Literal> littab = new ArrayList<>();
    private List<String> intermediate = new ArrayList<>();
    private List<IntermediateLine> intermediateLines = new ArrayList<>();

    private int locctr = 0x3000;
    private int startAddress = 0x3000;
    private int programLength = 0;

    public void run(String filename) throws IOException, AssemblyException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        runFromSource(sb.toString());
    }

    public void runFromSource(String sourceCode) throws AssemblyException {
        symtab.clear();
        littab.clear();
        intermediate.clear();
        intermediateLines.clear();

        if (sourceCode == null || sourceCode.trim().isEmpty()) {
            throw new AssemblyException("Assembly source code is empty.");
        }

        BufferedReader br = new BufferedReader(new StringReader(sourceCode));
        String line;
        int currentLineNum = 0;

        try {
            while ((line = br.readLine()) != null) {
                currentLineNum++;
                String rawLine = line;
                String trimmed = line.trim();

                // Strip trailing inline comment if any
                int commentIdx = trimmed.indexOf(';');
                if (commentIdx != -1) {
                    trimmed = trimmed.substring(0, commentIdx).trim();
                }

                // Ignore empty lines and comment lines (starting with .)
                if (trimmed.isEmpty() || trimmed.startsWith(".")) {
                    continue;
                }

                String[] parts = trimmed.split("\\s+");

                String label = "";
                String opcode;
                String operand = "";

                // Determine whether the first word is a label or an opcode/directive
                if (OpcodeTable.contains(parts[0])
                        || parts[0].equalsIgnoreCase("START")
                        || parts[0].equalsIgnoreCase("END")
                        || parts[0].equalsIgnoreCase("WORD")
                        || parts[0].equalsIgnoreCase("RESW")
                        || parts[0].equalsIgnoreCase("RESB")
                        || parts[0].equalsIgnoreCase("BYTE")
                        || parts[0].equalsIgnoreCase("LTORG")) {

                    opcode = parts[0].toUpperCase();

                    if (parts.length > 1) {
                        operand = parts[1];
                    }

                } else {

                    label = parts[0];
                    if (parts.length > 1) {
                        opcode = parts[1].toUpperCase();
                    } else {
                        throw new AssemblyException("Missing opcode after label: " + label, currentLineNum, rawLine);
                    }

                    if (parts.length > 2) {
                        operand = parts[2];
                    }
                }

                // START directive
                if (opcode.equals("START")) {
                    if (!operand.isEmpty()) {
                        try {
                            startAddress = Integer.parseInt(operand, 16);
                        } catch (NumberFormatException e) {
                            startAddress = 0x3000;
                        }
                    } else {
                        startAddress = 0x3000;
                    }
                    locctr = startAddress;
                    programName = !label.isEmpty() ? label : "MAIN";

                    if (!label.isEmpty()) {
                        symtab.put(label, new Symbol(label, String.format("%04X", locctr)));
                    }

                    intermediate.add(String.format("%04X\t%s", locctr, trimmed));
                    intermediateLines.add(new IntermediateLine(currentLineNum, locctr, label, opcode, operand, trimmed));
                    continue;
                }

                // Check symbol table for duplicate label
                if (!label.isEmpty()) {
                    if (symtab.containsKey(label)) {
                        throw new AssemblyException("Duplicate symbol found: " + label, currentLineNum, rawLine);
                    } else {
                        symtab.put(label, new Symbol(label, String.format("%04X", locctr)));
                    }
                }

                // Add literal to LITTAB if operand starts with '='
                if (operand.startsWith("=")) {
                    boolean exists = false;
                    for (Literal literal : littab) {
                        if (literal.getLiteral().equalsIgnoreCase(operand)) {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        String value;
                        int length;

                        if (operand.toUpperCase().startsWith("=X'")) {
                            value = operand.substring(3, operand.length() - 1);
                            if (value.length() % 2 != 0) {
                                value = "0" + value;
                            }
                            length = value.length() / 2;
                        } else if (operand.toUpperCase().startsWith("=C'")) {
                            String chars = operand.substring(3, operand.length() - 1);
                            StringBuilder hex = new StringBuilder();
                            for (char c : chars.toCharArray()) {
                                hex.append(String.format("%02X", (int) c));
                            }
                            value = hex.toString();
                            length = chars.length();
                        } else {
                            value = "";
                            length = 0;
                        }

                        littab.add(new Literal(operand, value, length));
                    }
                }

                intermediate.add(String.format("%04X\t%s", locctr, trimmed));
                intermediateLines.add(new IntermediateLine(currentLineNum, locctr, label, opcode, operand, trimmed));

                // Update LOCCTR
                if (OpcodeTable.contains(opcode)) {
                    locctr += 3;
                } else if (opcode.equals("WORD")) {
                    locctr += 3;
                } else if (opcode.equals("RESW")) {
                    try {
                        locctr += 3 * Integer.parseInt(operand);
                    } catch (NumberFormatException e) {
                        locctr += 3;
                    }
                } else if (opcode.equals("RESB")) {
                    try {
                        locctr += Integer.parseInt(operand);
                    } catch (NumberFormatException e) {
                        locctr += 1;
                    }
                } else if (opcode.equals("BYTE")) {
                    if (operand.toUpperCase().startsWith("C'")) {
                        int length = operand.substring(2, operand.length() - 1).length();
                        locctr += length;
                    } else if (operand.toUpperCase().startsWith("X'")) {
                        int length = operand.substring(2, operand.length() - 1).length();
                        locctr += (length + 1) / 2;
                    }
                } else if (opcode.equals("LTORG") || opcode.equals("END")) {
                    for (Literal literal : littab) {
                        if (literal.getAddress() == null) {
                            literal.setAddress(String.format("%04X", locctr));
                            intermediate.add(String.format("%04X\t*\t%s", locctr, literal.getLiteral()));
                            intermediateLines.add(new IntermediateLine(currentLineNum, locctr, "*", "LITERAL", literal.getLiteral(), "*\t" + literal.getLiteral()));
                            locctr += literal.getLength();
                        }
                    }

                    if (opcode.equals("END")) {
                        break;
                    }
                } else {
                    throw new AssemblyException("Unknown opcode/directive: " + opcode, currentLineNum, rawLine);
                }
            }
            br.close();
        } catch (IOException e) {
            throw new AssemblyException("IO Error reading source code: " + e.getMessage());
        }

        programLength = locctr - startAddress;
    }

    public void displayResults() {
        System.out.println("\n========== PASS 1 ==========\n");
        System.out.println("SYMBOL TABLE");
        System.out.println("--------------------");
        for (Symbol symbol : symtab.values()) {
            System.out.println(symbol.getName() + " -> " + symbol.getAddress());
        }

        System.out.println("\nLITERAL TABLE");
        System.out.println("--------------------");
        for (Literal literal : littab) {
            System.out.println(literal.getLiteral() + " -> " + literal.getAddress());
        }

        System.out.println("\nINTERMEDIATE FILE");
        System.out.println("--------------------");
        for (String line : intermediate) {
            System.out.println(line);
        }

        System.out.println("\nSTART ADDRESS : " + String.format("%04X", startAddress));
        System.out.println("PROGRAM LENGTH : " + String.format("%04X", programLength));
    }

    public String getProgramName() { return programName; }
    public Map<String, Symbol> getSymtab() { return symtab; }
    public List<Literal> getLittab() { return littab; }
    public List<String> getIntermediate() { return intermediate; }
    public List<IntermediateLine> getIntermediateLines() { return intermediateLines; }
    public int getStartAddress() { return startAddress; }
    public int getProgramLength() { return programLength; }
}