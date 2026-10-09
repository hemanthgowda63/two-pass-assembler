import java.util.HashMap;
import java.util.Map;

public class OpcodeTable {

    private static final Map<String, String> OPTAB = new HashMap<>();

    static {
        OPTAB.put("LDA", "00");
        OPTAB.put("LDX", "04");
        OPTAB.put("LDL", "08");
        OPTAB.put("STA", "0C");
        OPTAB.put("STX", "10");
        OPTAB.put("STL", "14");
        OPTAB.put("ADD", "18");
        OPTAB.put("SUB", "1C");
        OPTAB.put("MUL", "20");
        OPTAB.put("DIV", "24");
        OPTAB.put("COMP", "28");
        OPTAB.put("TIX", "2C");
        OPTAB.put("JEQ", "30");
        OPTAB.put("JGT", "34");
        OPTAB.put("JLT", "38");
        OPTAB.put("J", "3C");
        OPTAB.put("AND", "40");
        OPTAB.put("OR", "44");
        OPTAB.put("JSUB", "48");
        OPTAB.put("RSUB", "4C");
        OPTAB.put("LDCH", "50");
        OPTAB.put("STCH", "54");
        OPTAB.put("RD", "D8");
        OPTAB.put("WD", "DC");
        OPTAB.put("TD", "E0");
        OPTAB.put("STSW", "E8");
    }

    public static boolean contains(String mnemonic) {
        return OPTAB.containsKey(mnemonic.toUpperCase());
    }

    public static String getOpcode(String mnemonic) {
        return OPTAB.get(mnemonic.toUpperCase());
    }

    public static Map<String, String> getOptab() {
        return new HashMap<>(OPTAB);
    }
}