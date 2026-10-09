public class IntermediateLine {
    private int lineNumber;
    private int address;
    private String label;
    private String opcode;
    private String operand;
    private String rawLine;
    private String objectCode;

    public IntermediateLine(int lineNumber, int address, String label, String opcode, String operand, String rawLine) {
        this.lineNumber = lineNumber;
        this.address = address;
        this.label = label != null ? label : "";
        this.opcode = opcode != null ? opcode : "";
        this.operand = operand != null ? operand : "";
        this.rawLine = rawLine != null ? rawLine : "";
        this.objectCode = "";
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public int getAddress() {
        return address;
    }

    public String getAddressHex() {
        return String.format("%04X", address);
    }

    public String getLabel() {
        return label;
    }

    public String getOpcode() {
        return opcode;
    }

    public String getOperand() {
        return operand;
    }

    public String getRawLine() {
        return rawLine;
    }

    public String getObjectCode() {
        return objectCode;
    }

    public void setObjectCode(String objectCode) {
        this.objectCode = objectCode;
    }

    @Override
    public String toString() {
        return String.format("%04X\t%s", address, rawLine);
    }
}
