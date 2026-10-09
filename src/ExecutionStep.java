import java.util.*;

public class ExecutionStep {
    private int stepNumber;
    private int lineNumber;
    private int address;
    private String addressHex;
    private String label;
    private String opcode;
    private String operand;
    private String rawLine;
    private String objectCode;
    private String explanation;
    private String operationFormula;

    private Map<String, String> registersBefore;
    private Map<String, String> registersAfter;
    private List<MemoryChange> memoryChanges;

    private int callDepth;
    private String currentSubroutine;
    private boolean isFinished;

    public ExecutionStep(
            int stepNumber,
            int lineNumber,
            int address,
            String label,
            String opcode,
            String operand,
            String rawLine,
            String objectCode,
            String explanation,
            String operationFormula,
            Map<String, String> registersBefore,
            Map<String, String> registersAfter,
            List<MemoryChange> memoryChanges,
            int callDepth,
            String currentSubroutine,
            boolean isFinished) {

        this.stepNumber = stepNumber;
        this.lineNumber = lineNumber;
        this.address = address;
        this.addressHex = String.format("%04X", address);
        this.label = label != null ? label : "";
        this.opcode = opcode != null ? opcode : "";
        this.operand = operand != null ? operand : "";
        this.rawLine = rawLine != null ? rawLine : "";
        this.objectCode = objectCode != null ? objectCode : "";
        this.explanation = explanation != null ? explanation : "";
        this.operationFormula = operationFormula != null ? operationFormula : "";
        this.registersBefore = registersBefore;
        this.registersAfter = registersAfter;
        this.memoryChanges = memoryChanges != null ? memoryChanges : new ArrayList<>();
        this.callDepth = callDepth;
        this.currentSubroutine = currentSubroutine != null ? currentSubroutine : "MAIN";
        this.isFinished = isFinished;
    }

    public int getStepNumber() { return stepNumber; }
    public int getLineNumber() { return lineNumber; }
    public int getAddress() { return address; }
    public String getAddressHex() { return addressHex; }
    public String getLabel() { return label; }
    public String getOpcode() { return opcode; }
    public String getOperand() { return operand; }
    public String getRawLine() { return rawLine; }
    public String getObjectCode() { return objectCode; }
    public String getExplanation() { return explanation; }
    public String getOperationFormula() { return operationFormula; }
    public Map<String, String> getRegistersBefore() { return registersBefore; }
    public Map<String, String> getRegistersAfter() { return registersAfter; }
    public List<MemoryChange> getMemoryChanges() { return memoryChanges; }
    public int getCallDepth() { return callDepth; }
    public String getCurrentSubroutine() { return currentSubroutine; }
    public boolean isFinished() { return isFinished; }

    public static class MemoryChange {
        private int address;
        private String addressHex;
        private String label;
        private int oldValue;
        private int newValue;

        public MemoryChange(int address, String label, int oldValue, int newValue) {
            this.address = address;
            this.addressHex = String.format("%04X", address);
            this.label = label != null ? label : "";
            this.oldValue = oldValue;
            this.newValue = newValue;
        }

        public int getAddress() { return address; }
        public String getAddressHex() { return addressHex; }
        public String getLabel() { return label; }
        public int getOldValue() { return oldValue; }
        public int getNewValue() { return newValue; }
    }
}
