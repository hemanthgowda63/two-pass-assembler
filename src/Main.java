import java.util.*;

public class Main {

    public static void main(String[] args) {
        try {
            System.out.println("=== SIC TWO-PASS ASSEMBLER & SIMULATOR ===");

            // Pass 1
            Pass1 pass1 = new Pass1();
            pass1.run("src/input.txt");
            pass1.displayResults();

            // Pass 2
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
            pass2.displayObjectCode();
            pass2.generateObjectProgram();

            // Execution Simulation
            System.out.println("\n========== EXECUTION SIMULATION ==========\n");
            Simulator simulator = new Simulator(
                    pass1.getStartAddress(),
                    pass1.getProgramLength(),
                    pass1.getSymtab(),
                    pass1.getIntermediateLines()
            );

            List<ExecutionStep> steps = simulator.execute();

            System.out.printf("%-6s %-8s %-18s %-12s %-40s%n", "Step", "Address", "Instruction", "Object Code", "Explanation");
            System.out.println("---------------------------------------------------------------------------------------------------------");

            for (ExecutionStep step : steps) {
                System.out.printf("%-6d %-8s %-18s %-12s %-40s%n",
                        step.getStepNumber(),
                        step.getAddressHex(),
                        step.getOpcode() + " " + step.getOperand(),
                        step.getObjectCode(),
                        step.getExplanation()
                );
                if (!step.getRegistersAfter().isEmpty()) {
                    System.out.printf("       -> Registers: A=%s | L=%s | PC=%s%n",
                            step.getRegistersAfter().get("A_DEC"),
                            step.getRegistersAfter().get("L_HEX"),
                            step.getRegistersAfter().get("PC_HEX")
                    );
                }
                for (ExecutionStep.MemoryChange mc : step.getMemoryChanges()) {
                    System.out.printf("       -> Memory Changed: %s (%s) = %d (Hex 0x%06X)%n",
                            mc.getLabel(), mc.getAddressHex(), mc.getNewValue(), mc.getNewValue() & 0xFFFFFF);
                }
            }

            int resultVal = simulator.readWord(0x3018); // Address of RESULT symbol
            System.out.println("\n---------------------------------------------------------------------------------------------------------");
            System.out.println("FINAL SIMULATION VERIFICATION:");
            System.out.println("NUM1 (3012)   = " + simulator.readWord(0x3012));
            System.out.println("NUM2 (3015)   = " + simulator.readWord(0x3015));
            System.out.println("RESULT (3018) = " + resultVal);
            System.out.println("EXPECTED      = 40");
            System.out.println("STATUS        = " + (resultVal == 40 ? "SUCCESS (RESULT MATCHES EXPECTED 40)" : "FAILED"));

        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}