import React, { useState, useRef } from "react";

const DEFAULT_CROP = { x: 50, y: 20, zoom: 1 };

function MediaCropPicker({ previews = [], crops = [], activeIndex = 0, onChange }) {
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef(null);

  if (!previews.length) return null;

  const safeIndex = Math.min(activeIndex, previews.length - 1);
  const current = {
    ...DEFAULT_CROP,
    ...(crops[safeIndex] || {}),
  };

  const updateCropAtIndex = (idx, patch) => {
    const next = previews.map((_, i) => ({
      ...DEFAULT_CROP,
      ...(crops[i] || {}),
      ...(i === idx ? patch : {}),
    }));
    onChange(next);
  };

  const updatePositionFromClientXY = (clientX, clientY) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;

    const x = Math.round(
      Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    );
    const y = Math.round(
      Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    );
    updateCropAtIndex(safeIndex, { x, y });
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updatePositionFromClientXY(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    updatePositionFromClientXY(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const currentPreview = previews[safeIndex];
  const isVideo =
    typeof currentPreview === "string" &&
    (currentPreview.startsWith("data:video") ||
      currentPreview.match(/\.(mp4|mov|webm|mkv|avi)$/i) ||
      currentPreview.includes("/video/upload/"));

  return (
    <div className="space-y-2 my-3 p-3 rounded-lg border border-zinc-200 bg-gray-50/70">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-medium text-zinc-700">
          Adjust feed framing (drag or tap)
        </span>
        <button
          type="button"
          onClick={() => updateCropAtIndex(safeIndex, { ...DEFAULT_CROP })}
          className="text-xs text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div
        ref={boxRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full aspect-3/2 rounded-lg overflow-hidden bg-zinc-200 select-none touch-none cursor-grab active:cursor-grabbing"
      >
        {isVideo ? (
          <video
            src={currentPreview}
            muted
            playsInline
            style={{
              objectPosition: `${current.x}% ${current.y}%`,
              transformOrigin: `${current.x}% ${current.y}%`,
              transform: current.zoom > 1 ? `scale(${current.zoom})` : undefined,
            }}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <img
            src={currentPreview}
            alt={`Preview ${safeIndex + 1}`}
            draggable={false}
            style={{
              objectPosition: `${current.x}% ${current.y}%`,
              transformOrigin: `${current.x}% ${current.y}%`,
              transform: current.zoom > 1 ? `scale(${current.zoom})` : undefined,
            }}
            className="w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Focus indicator */}
        <div
          style={{ left: `${current.x}%`, top: `${current.y}%` }}
          className="w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white bg-black/50 shadow pointer-events-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <label className="text-xs text-zinc-600 whitespace-nowrap">
          Zoom: {current.zoom.toFixed(1)}x
        </label>
        <input
          type="range"
          min="1"
          max="2"
          step="0.1"
          value={current.zoom}
          onChange={(e) =>
            updateCropAtIndex(safeIndex, { zoom: parseFloat(e.target.value) })
          }
          className="w-full accent-black cursor-pointer"
        />
      </div>
    </div>
  );
}

export default MediaCropPicker;