import java.util.*;

public class SicEngine {

    public static class RunResult {
        public boolean success;
        public String errorMessage;
        public int errorLine;
        public String errorLineText;

        public String programName;
        public String startAddress;
        public String programLength;

        public List<Map<String, String>> symtab = new ArrayList<>();
        public List<Map<String, String>> littab = new ArrayList<>();
        public List<Map<String, Object>> intermediate = new ArrayList<>();
        public Map<String, Object> objectProgram = new LinkedHashMap<>();
        public List<Map<String, Object>> executionTrace = new ArrayList<>();
        public List<Map<String, Object>> memorySnapshot = new ArrayList<>();
    }

    public static RunResult assembleAndRun(String assemblySource) {
        RunResult result = new RunResult();
        try {
            Pass1 pass1 = new Pass1();
            pass1.runFromSource(assemblySource);

            Pass2 pass2 = new Pass2(
                    pass1.getProgramName(),
                    pass1.getSymtab(),
                    pass1.getLittab(),
                    pass1.getIntermediateLines(),
                    pass1.getStartAddress(),
                    pass1.getProgramLength(),
                    true
            );
            pass2.run();

            Simulator simulator = new Simulator(
                    pass1.getStartAddress(),
                    pass1.getProgramLength(),
                    pass1.getSymtab(),
                    pass1.getIntermediateLines()
            );

            List<ExecutionStep> steps = simulator.execute();

            // Populate Success Result
            result.success = true;
            result.programName = pass1.getProgramName();
            result.startAddress = String.format("%04X", pass1.getStartAddress());
            result.programLength = String.format("%04X", pass1.getProgramLength());

            // Symbol Table
            for (Symbol sym : pass1.getSymtab().values()) {
                Map<String, String> m = new LinkedHashMap<>();
                m.put("symbol", sym.getName());
                m.put("address", sym.getAddress());
                result.symtab.add(m);
            }

            // Literal Table
            for (Literal lit : pass1.getLittab()) {
                Map<String, String> m = new LinkedHashMap<>();
                m.put("literal", lit.getLiteral());
                m.put("value", lit.getValue());
                m.put("length", String.valueOf(lit.getLength()));
                m.put("address", lit.getAddress());
                result.littab.add(m);
            }

            // Intermediate Lines
            for (IntermediateLine line : pass1.getIntermediateLines()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("lineNumber", line.getLineNumber());
                m.put("address", line.getAddressHex());
                m.put("label", line.getLabel());
                m.put("opcode", line.getOpcode());
                m.put("operand", line.getOperand());
                m.put("rawLine", line.getRawLine());
                m.put("objectCode", line.getObjectCode());
                result.intermediate.add(m);
            }

            // Object Program H/T/E
            List<String> textRecords = new ArrayList<>();
            String header = String.format("H^%-6s^%06X^%06X", pass1.getProgramName(), pass1.getStartAddress(), pass1.getProgramLength());
            result.objectProgram.put("header", header);

            StringBuilder currentText = new StringBuilder();
            int tStart = -1;
            int tLen = 0;

            for (IntermediateLine line : pass1.getIntermediateLines()) {
                String code = line.getObjectCode();
                if (code == null || code.isEmpty()) continue;
                int addr = line.getAddress();
                int cLen = code.length() / 2;

                if (tStart == -1) {
                    tStart = addr;
                    tLen = 0;
                    currentText.setLength(0);
                }

                if (tLen + cLen > 30 || (tLen > 0 && addr != tStart + tLen)) {
                    textRecords.add(String.format("T^%06X^%02X^%s", tStart, tLen, currentText.toString()));
                    tStart = addr;
                    tLen = 0;
                    currentText.setLength(0);
                }

                if (currentText.length() > 0) currentText.append("^");
                currentText.append(code);
                tLen += cLen;
            }
            if (tLen > 0) {
                textRecords.add(String.format("T^%06X^%02X^%s", tStart, tLen, currentText.toString()));
            }

            int endAddr = pass1.getStartAddress();
            String endOp = pass2.getEndOperand();
            if (endOp != null && !endOp.isEmpty()) {
                if (pass1.getSymtab().containsKey(endOp)) {
                    endAddr = Integer.parseInt(pass1.getSymtab().get(endOp).getAddress(), 16);
                }
            }
            String endRecord = String.format("E^%06X", endAddr);

            result.objectProgram.put("textRecords", textRecords);
            result.objectProgram.put("endRecord", endRecord);

            // Execution Steps
            for (ExecutionStep step : steps) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("stepNumber", step.getStepNumber());
                m.put("lineNumber", step.getLineNumber());
                m.put("address", step.getAddressHex());
                m.put("label", step.getLabel());
                m.put("opcode", step.getOpcode());
                m.put("operand", step.getOperand());
                m.put("rawLine", step.getRawLine());
                m.put("objectCode", step.getObjectCode());
                m.put("explanation", step.getExplanation());
                m.put("operationFormula", step.getOperationFormula());
                m.put("registersBefore", step.getRegistersBefore());
                m.put("registersAfter", step.getRegistersAfter());
                m.put("callDepth", step.getCallDepth());
                m.put("currentSubroutine", step.getCurrentSubroutine());
                m.put("isFinished", step.isFinished());

                List<Map<String, Object>> memChg = new ArrayList<>();
                for (ExecutionStep.MemoryChange mc : step.getMemoryChanges()) {
                    Map<String, Object> mm = new LinkedHashMap<>();
                    mm.put("address", mc.getAddressHex());
                    mm.put("label", mc.getLabel());
                    mm.put("oldValue", mc.getOldValue());
                    mm.put("newValue", mc.getNewValue());
                    memChg.add(mm);
                }
                m.put("memoryChanges", memChg);
                result.executionTrace.add(m);
            }

            // Memory Snapshot for defined memory locations
            for (IntermediateLine line : pass1.getIntermediateLines()) {
                int addr = line.getAddress();
                String label = line.getLabel();
                String opcode = line.getOpcode();
                int wordVal = simulator.readWord(addr);

                Map<String, Object> memEntry = new LinkedHashMap<>();
                memEntry.put("address", line.getAddressHex());
                memEntry.put("label", label);
                memEntry.put("opcode", opcode);
                memEntry.put("valueDec", wordVal);
                memEntry.put("valueHex", String.format("%06X", wordVal & 0xFFFFFF));
                memEntry.put("objectCode", line.getObjectCode());

                result.memorySnapshot.add(memEntry);
            }

        } catch (AssemblyException e) {
            result.success = false;
            result.errorMessage = e.getMessage();
            result.errorLine = e.getLineNumber();
            result.errorLineText = e.getLineText();
        } catch (Exception e) {
            result.success = false;
            result.errorMessage = "Internal Error: " + e.getMessage();
            result.errorLine = -1;
            result.errorLineText = "";
        }

        return result;
    }

    public static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        if (obj instanceof Boolean || obj instanceof Number) {
            return obj.toString();
        }
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                sb.append(toJson(list.get(i)));
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            StringBuilder sb = new StringBuilder("{");
            int count = 0;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                sb.append("\"").append(escapeJson(String.valueOf(entry.getKey()))).append("\":");
                sb.append(toJson(entry.getValue()));
                count++;
                if (count < map.size()) sb.append(",");
            }
            sb.append("}");
            return sb.toString();
        }
        if (obj instanceof RunResult) {
            RunResult res = (RunResult) obj;
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("success", res.success);
            map.put("errorMessage", res.errorMessage);
            map.put("errorLine", res.errorLine);
            map.put("errorLineText", res.errorLineText);
            map.put("programName", res.programName);
            map.put("startAddress", res.startAddress);
            map.put("programLength", res.programLength);
            map.put("symtab", res.symtab);
            map.put("littab", res.littab);
            map.put("intermediate", res.intermediate);
            map.put("objectProgram", res.objectProgram);
            map.put("executionTrace", res.executionTrace);
            map.put("memorySnapshot", res.memorySnapshot);
            return toJson(map);
        }
        return "\"" + escapeJson(obj.toString()) + "\"";
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }
}
