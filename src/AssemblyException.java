public class AssemblyException extends Exception {
    private final int lineNumber;
    private final String lineText;

    public AssemblyException(String message, int lineNumber, String lineText) {
        super(message);
        this.lineNumber = lineNumber;
        this.lineText = lineText;
    }

    public AssemblyException(String message) {
        this(message, -1, "");
    }

    public int getLineNumber() {
        return lineNumber;
    }

    public String getLineText() {
        return lineText;
    }
}
