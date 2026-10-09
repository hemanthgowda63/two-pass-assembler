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
    <div className="brutalist-card bg-amber-200 border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-wrap items-center justify-between gap-4">
      {/* Control Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onReset}
          className="brutalist-btn brutalist-btn-white text-xs py-2 px-3"
          title="Reset to Step 0"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        <button
          onClick={onStepBackward}
          disabled={isAtStart || isPlaying}
          className="brutalist-btn brutalist-btn-white text-xs py-2 px-3"
          title="Previous Step"
        >
          <SkipBack className="w-4 h-4" />
          Prev Step
        </button>

        {isPlaying ? (
          <button
            onClick={onPause}
            className="brutalist-btn brutalist-btn-pink text-xs py-2 px-4"
          >
            <Pause className="w-4 h-4 fill-current" />
            Pause
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={isAtEnd}
            className="brutalist-btn brutalist-btn-cyan text-xs py-2 px-4"
          >
            <Play className="w-4 h-4 fill-current" />
            Auto Run
          </button>
        )}

        <button
          onClick={onStepForward}
          disabled={isAtEnd || isPlaying}
          className="brutalist-btn brutalist-btn-green text-xs py-2 px-4"
          title="Next Step"
        >
          <span>Step Forward</span>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Progress & Speed */}
      <div className="flex items-center gap-4">
        <div className="brutalist-badge brutalist-badge-white text-sm py-1 px-3">
          STEP <span className="font-black text-black">{totalSteps > 0 ? currentStepIndex + 1 : 0}</span> / {totalSteps}
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <Sliders className="w-4 h-4 text-black" />
          <span className="text-xs font-bold font-mono uppercase">Speed:</span>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={2200 - speedMs}
            onChange={(e) => onChangeSpeed(2200 - Number(e.target.value))}
            className="w-24 accent-black cursor-pointer"
          />
          <span className="text-xs font-mono font-bold w-12 text-right">
            {(speedMs / 1000).toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}
