import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import RegisterPanel from './components/RegisterPanel';
import StepController from './components/StepController';
import InstructionExplanation from './components/InstructionExplanation';
import SubroutineGraph from './components/SubroutineGraph';
import MemoryTable from './components/MemoryTable';
import SymbolAndLocctrTable from './components/SymbolAndLocctrTable';
import ExecutionTimeline from './components/ExecutionTimeline';
import ResultCard from './components/ResultCard';

import { assembleAndSimulate } from './utils/sicSimulator';
import { AlertTriangle } from 'lucide-react';

const SAMPLE_PROGRAM = `MAIN        START   3000
            LDA     NUM1
            JSUB    ADDNUM
            STA     RESULT
            RSUB

ADDNUM      ADD     NUM2
            RSUB

NUM1        WORD    25
NUM2        WORD    15
RESULT      RESW    1
            END     MAIN`;

export default function App() {
  const [code, setCode] = useState(SAMPLE_PROGRAM);
  const [simulationData, setSimulationData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1000);
  const [isConnected, setIsConnected] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyError, setAssemblyError] = useState(null);

  const timerRef = useRef(null);

  // Initial Assembly & Connection Test on mount
  useEffect(() => {
    handleAssembleAndRun(SAMPLE_PROGRAM);
  }, []);

  const handleAssembleAndRun = async (srcCode = code) => {
    setIsAssembling(true);
    setAssemblyError(null);

    try {
      // Attempt backend API call
      const response = await fetch('http://localhost:8080/api/assemble-and-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: srcCode })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsConnected(true);
          setSimulationData(data);
          setCurrentStepIndex(0);
          setIsPlaying(false);
        } else {
          setAssemblyError(data);
        }
      } else {
        throw new Error('Backend unavailable');
      }
    } catch (err) {
      // Fallback to client-side simulation engine
      setIsConnected(false);
      const data = assembleAndSimulate(srcCode);
      if (data.success) {
        setSimulationData(data);
        setCurrentStepIndex(0);
        setIsPlaying(false);
      } else {
        setAssemblyError(data);
      }
    } finally {
      setIsAssembling(false);
    }
  };

  // Timer loop for Auto Play
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const total = simulationData?.executionTrace?.length || 0;
          if (prev >= total - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speedMs, simulationData]);

  const executionTrace = simulationData?.executionTrace || [];
  const currentStep = executionTrace[currentStepIndex] || null;
  const prevStep = executionTrace[currentStepIndex - 1] || null;
  const totalSteps = executionTrace.length;

  const currentLineNumber = currentStep?.lineNumber || 1;
  const isFinished = currentStepIndex === totalSteps - 1 && totalSteps > 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header
          isConnected={isConnected}
          onResetSample={() => {
            setCode(SAMPLE_PROGRAM);
            handleAssembleAndRun(SAMPLE_PROGRAM);
          }}
        />

        {/* Educational Assembly Error Banner */}
        {assemblyError && (
          <div className="glass-card p-4 bg-rose-950/40 border border-rose-500/50 text-rose-200 flex items-start gap-3 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-none mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-300">
                Assembly Error {assemblyError.errorLine > 0 && `on Line ${assemblyError.errorLine}`}
              </div>
              <p className="text-xs text-rose-200 mt-1">{assemblyError.errorMessage}</p>
              {assemblyError.errorLineText && (
                <div className="font-mono text-xs bg-black/40 p-2 rounded mt-2 text-rose-300">
                  {assemblyError.errorLineText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Section: Code Editor (Left) & Registers + Instruction Breakdown (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[460px]">
            <CodeEditor
              code={code}
              onChangeCode={setCode}
              currentLineNumber={currentLineNumber}
              onAssembleAndRun={() => handleAssembleAndRun(code)}
              isAssembling={isAssembling}
            />
          </div>

          <div className="lg:col-span-4 h-[460px]">
            <InstructionExplanation currentStep={currentStep} />
          </div>

          <div className="lg:col-span-3 h-[460px]">
            <RegisterPanel currentStep={currentStep} prevStep={prevStep} />
          </div>
        </div>

        {/* Controls Bar */}
        <StepController
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onStepForward={() => setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1))}
          onStepBackward={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
          onReset={() => {
            setIsPlaying(false);
            setCurrentStepIndex(0);
          }}
          speedMs={speedMs}
          onChangeSpeed={setSpeedMs}
        />

        {/* Final Result Card when finished */}
        {isFinished && (
          <ResultCard
            memorySnapshot={simulationData?.memorySnapshot}
            totalSteps={totalSteps}
            isFinished={isFinished}
          />
        )}

        {/* Middle Section: Subroutine Call Graph + Symbol/LOCCTR Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[280px]">
            <SubroutineGraph currentStep={currentStep} />
          </div>

          <div className="lg:col-span-7 h-[280px]">
            <SymbolAndLocctrTable
              symtab={simulationData?.symtab}
              intermediateLines={simulationData?.intermediate}
            />
          </div>
        </div>

        {/* Bottom Section: Memory Table & Execution Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <MemoryTable
              memorySnapshot={simulationData?.memorySnapshot}
              currentStep={currentStep}
            />
          </div>

          <div className="lg:col-span-4">
            <ExecutionTimeline
              executionTrace={executionTrace}
              currentStepIndex={currentStepIndex}
              onSelectStep={(idx) => {
                setIsPlaying(false);
                setCurrentStepIndex(idx);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
