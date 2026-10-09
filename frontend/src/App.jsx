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
import { AlertTriangle, Database, Tag, History, Award } from 'lucide-react';

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
  const [bottomTab, setBottomTab] = useState('memory'); // 'memory' | 'symtab' | 'timeline' | 'result'

  const timerRef = useRef(null);

  // Initial Assembly & Execution on mount
  useEffect(() => {
    handleAssembleAndRun(SAMPLE_PROGRAM);
  }, []);

  const handleAssembleAndRun = async (srcCode = code) => {
    setIsAssembling(true);
    setAssemblyError(null);

    try {
      // Attempt backend API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('http://localhost:8080/api/assemble-and-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: srcCode }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsConnected(true);
          setSimulationData(data);
          setCurrentStepIndex(0);
          setIsPlaying(false);
          return;
        } else {
          setAssemblyError(data);
          return;
        }
      }
    } catch (err) {
      // Fallback to client-side engine seamlessly
      setIsConnected(false);
    }

    // Run client simulator engine
    const data = assembleAndSimulate(srcCode);
    if (data.success) {
      setSimulationData(data);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } else {
      setAssemblyError(data);
    }
    setIsAssembling(false);
  };

  // Timer loop for Auto Play
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const total = simulationData?.executionTrace?.length || 0;
          if (prev >= total - 1) {
            setIsPlaying(false);
            setBottomTab('result'); // Switch to result tab automatically at end
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
    <div className="app-container">
      {/* Compact Header */}
      <Header
        isConnected={isConnected}
        onResetSample={() => {
          setCode(SAMPLE_PROGRAM);
          handleAssembleAndRun(SAMPLE_PROGRAM);
        }}
      />

      {/* Assembly Error Callout */}
      {assemblyError && (
        <div className="brutalist-card bg-rose-200 border-3 border-black text-black flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-black flex-none mt-0.5" />
          <div>
            <div className="font-black text-xs uppercase">
              Assembly Error {assemblyError.errorLine > 0 && `on Line ${assemblyError.errorLine}`}
            </div>
            <p className="text-xs font-bold mt-0.5">{assemblyError.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Single-Screen Dashboard Grid (3 Columns) */}
      <div className="grid-3col">
        {/* Column 1: Assembly Code Editor */}
        <div className="h-[400px]">
          <CodeEditor
            code={code}
            onChangeCode={setCode}
            currentLineNumber={currentLineNumber}
            onAssembleAndRun={() => handleAssembleAndRun(code)}
            isAssembling={isAssembling}
          />
        </div>

        {/* Column 2: Step Controls & Dynamic Breakdown */}
        <div className="flex flex-col gap-3 h-[400px]">
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

          <div className="flex-1">
            <InstructionExplanation currentStep={currentStep} />
          </div>
        </div>

        {/* Column 3: CPU Registers */}
        <div className="h-[400px]">
          <RegisterPanel currentStep={currentStep} prevStep={prevStep} />
        </div>
      </div>

      {/* Bottom Panel: Tabbed Data & Subroutine / Memory Dashboard */}
      <div className="brutalist-card bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000]">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b-3 border-black pb-2 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBottomTab('memory')}
              className={`brutalist-btn text-xs py-1 px-3 ${
                bottomTab === 'memory' ? 'brutalist-btn-green' : 'brutalist-btn-white'
              }`}
            >
              <Database className="w-4 h-4" />
              Memory Table
            </button>

            <button
              onClick={() => setBottomTab('symtab')}
              className={`brutalist-btn text-xs py-1 px-3 ${
                bottomTab === 'symtab' ? 'brutalist-btn-purple' : 'brutalist-btn-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              Symbol & LOCCTR Table
            </button>

            <button
              onClick={() => setBottomTab('timeline')}
              className={`brutalist-btn text-xs py-1 px-3 ${
                bottomTab === 'timeline' ? 'brutalist-btn-cyan' : 'brutalist-btn-white'
              }`}
            >
              <History className="w-4 h-4" />
              Execution Trace ({totalSteps} Steps)
            </button>

            {isFinished && (
              <button
                onClick={() => setBottomTab('result')}
                className={`brutalist-btn text-xs py-1 px-3 ${
                  bottomTab === 'result' ? 'brutalist-btn-yellow' : 'brutalist-btn-white'
                }`}
              >
                <Award className="w-4 h-4" />
                Final Result Summary
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Panels */}
        {bottomTab === 'memory' && (
          <MemoryTable
            memorySnapshot={simulationData?.memorySnapshot}
            currentStep={currentStep}
          />
        )}

        {bottomTab === 'symtab' && (
          <SymbolAndLocctrTable
            symtab={simulationData?.symtab}
            intermediateLines={simulationData?.intermediate}
          />
        )}

        {bottomTab === 'timeline' && (
          <ExecutionTimeline
            executionTrace={executionTrace}
            currentStepIndex={currentStepIndex}
            onSelectStep={(idx) => {
              setIsPlaying(false);
              setCurrentStepIndex(idx);
            }}
          />
        )}

        {bottomTab === 'result' && (
          <ResultCard
            memorySnapshot={simulationData?.memorySnapshot}
            totalSteps={totalSteps}
            isFinished={isFinished}
          />
        )}
      </div>
    </div>
  );
}
