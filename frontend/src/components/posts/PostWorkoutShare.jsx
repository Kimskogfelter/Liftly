import React from "react";

function PostWorkoutShare({ workoutShare }) {
    if (!workoutShare) return null;

    return (
        <div className="mt-3 mb-2 bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 text-gray-800 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-bold text-zinc-900 truncate">
                    {workoutShare.title}
                </h4>
                {workoutShare.date && (
                    <span className="text-[11px] font-medium text-zinc-400 shrink-0">
                        {workoutShare.date}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-left">
                <div className="bg-white border border-zinc-200/80 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-zinc-400">Total Lifted</p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        {Number(workoutShare.totalVolume || 0).toLocaleString()} kg
                    </p>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-zinc-400">Exercises</p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        {workoutShare.exercisesCount ?? 0}
                    </p>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-zinc-400">Sets Done</p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        {workoutShare.completedSetsCount ?? 0}/{workoutShare.totalSetsCount ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PostWorkoutShare;