import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Sliders } from 'lucide-react';

export default function StepController({
  currentStepIndex,
  totalSteps,
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  speedMs,
  onChangeSpeed
}) {
  const isAtStart = currentStepIndex <= 0;
  const isAtEnd = totalSteps === 0 || currentStepIndex >= totalSteps - 1;

  return (
    <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="btn btn-secondary text-xs py-2 px-3"
          title="Reset to Step 0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        <button
          onClick={onStepBackward}
          disabled={isAtStart || isPlaying}
          className="btn btn-secondary text-xs py-2 px-3"
          title="Previous Step"
        >
          <SkipBack className="w-3.5 h-3.5" />
          Prev Step
        </button>

        {isPlaying ? (
          <button
            onClick={onPause}
            className="btn btn-primary bg-amber-500 text-black text-xs py-2 px-4 shadow-amber-500/20"
          >
            <Pause className="w-4 h-4 fill-current" />
            Pause
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={isAtEnd}
            className="btn btn-primary text-xs py-2 px-4"
          >
            <Play className="w-4 h-4 fill-current" />
            Auto Run
          </button>
        )}

        <button
          onClick={onStepForward}
          disabled={isAtEnd || isPlaying}
          className="btn btn-primary text-xs py-2 px-4 bg-cyan-500 text-black"
          title="Next Step"
        >
          <span>Step Forward</span>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Step Counter */}
      <div className="flex items-center gap-3">
        <div className="text-xs font-mono font-medium text-gray-300">
          Step <span className="text-cyan-400 font-bold">{totalSteps > 0 ? currentStepIndex + 1 : 0}</span> of{' '}
          <span className="text-gray-400">{totalSteps}</span>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 bg-[#0e1628] px-3 py-1.5 rounded-lg border border-gray-800">
          <Sliders className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400 font-mono">Speed:</span>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={2200 - speedMs}
            onChange={(e) => onChangeSpeed(2200 - Number(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] text-cyan-400 font-mono w-10 text-right">
            {(speedMs / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}
