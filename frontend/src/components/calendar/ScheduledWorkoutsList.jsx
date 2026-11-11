import React from 'react';
import { FiCheck } from "react-icons/fi";
import { LuDumbbell, LuFileText } from "react-icons/lu";

const ScheduledWorkoutsList = ({
    loading,
    logsForSelectedDate,
    navigate,
    handleToggleComplete,
    handleDeleteLog
}) => {
    return (
        <div className="space-y-3">
            <h2 className="font-semibold text-zinc-900 text-xs">Scheduled Workouts</h2>
            {loading ? (
                <p className="text-xs text-zinc-400">Loading...</p>
            ) : logsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-zinc-500 text-xs font-medium">No workouts scheduled for this date.</p>
                </div>
            ) : (
                logsForSelectedDate.map((log) => {
                    const hasWorkout = Boolean(log.workout);
                    const workoutId = log.workout?._id || log.workout;

                    return (
                        <div 
                            key={log._id} 
                            className={`border p-3 sm:p-4 rounded-lg flex flex-row justify-between items-center gap-2 sm:gap-3 shadow-sm transition ${
                                hasWorkout 
                                    ? "bg-white border-gray-100" 
                                    : "bg-zinc-50/75 border-zinc-200/80"
                            }`}
                        >
                            <div className="min-w-0 flex-1">
                                {hasWorkout ? (
                                    <div className="flex items-center gap-1.5">
                                        <p
                                            onClick={() => {
                                                if (workoutId) {
                                                    navigate(`/workouts/${workoutId}`);
                                                }
                                            }}
                                            className={`font-semibold text-xs truncate cursor-pointer hover:underline hover:text-blue-600 transition ${
                                                log.completed ? "line-through text-zinc-400" : "text-zinc-900"
                                            }`}
                                            title={log.title}
                                        >
                                            {log.title}
                                        </p>
                                        {/* Snygg Lucide-hantel som matchar TrainingPage */}
                                        <LuDumbbell size={13} className="text-zinc-400 shrink-0" title="Workout" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-medium text-xs text-zinc-800 truncate" title={log.title}>
                                            {log.title}
                                        </p>
                                        {/* Diskret ikon för anteckning */}
                                        <LuFileText size={13} className="text-zinc-400 shrink-0" title="Note" />
                                    </div>
                                )}

                                {log.notes && log.notes !== log.title && (
                                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{log.notes}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                {hasWorkout && (
                                    <button
                                        onClick={() => handleToggleComplete(log._id, log.completed)}
                                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                                            log.completed
                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                                        }`}
                                    >
                                        <FiCheck size={14} className={log.completed ? "text-green-700" : "text-zinc-600"} />
                                        <span className="text-[11px]">{log.completed ? "Done" : "Mark as Done"}</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDeleteLog(log._id)}
                                    className="text-zinc-400 hover:text-red-600 text-xs font-medium transition cursor-pointer px-1.5 sm:px-2 py-1.5"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ScheduledWorkoutsList;