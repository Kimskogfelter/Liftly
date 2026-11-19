import React, { useState } from "react";
import { LuDumbbell } from "react-icons/lu";
import api from "../../api/axios";

function WorkoutCard({ workout, currentUser, onExercisesChange }) {
    const [exercises, setExercises] = useState(workout?.exercises || []);

    const updateExercisesState = (updatedExercises) => {
        setExercises(updatedExercises);
        onExercisesChange?.(updatedExercises);
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        const parsedValue = value === "" ? "" : Number(value);
        const updatedExercises = exercises.map((exercise, exIdx) => {
            if (exIdx !== exerciseIndex) return exercise;
            const updatedSets = exercise.sets.map((set, sIdx) =>
                sIdx === setIndex ? { ...set, [field]: parsedValue } : set
            );
            return { ...exercise, sets: updatedSets };
        });
        updateExercisesState(updatedExercises);
    };

    const autoSaveWorkout = async (exerciseList) => {
        try {
            await api.patch(`/workouts/${workout._id}/update`, {
                exercises: exerciseList,
            });
        } catch (err) {
            // console.error("Auto-save failed:", err);
        }
    };

    const toggleSetComplete = (exerciseIndex, setIndex) => {
        const updatedExercises = exercises.map((exercise, exIdx) => {
            if (exIdx !== exerciseIndex) return exercise;
            const updatedSets = exercise.sets.map((set, sIdx) =>
                sIdx === setIndex ? { ...set, completed: !set.completed } : set
            );
            return { ...exercise, sets: updatedSets };
        });

        updateExercisesState(updatedExercises);
        autoSaveWorkout(updatedExercises);
    };

    const allSets = exercises.flatMap((ex) => ex.sets || []);
    const completedSetsCount = allSets.filter((s) => Boolean(s.completed)).length;
    const liveVolume = allSets.reduce((sum, s) => {
        if (!s.completed) return sum;
        return sum + (Number(s.kgs) || 0) * (Number(s.reps) || 0);
    }, 0);

    return (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 max-w-lg mx-auto shadow-xs w-full">
            {/* Subtil progress-bar & live-stats i toppen av kortet */}
            <div className="mb-5 pb-4 border-b border-zinc-100">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-zinc-500">
                        {completedSetsCount} of {allSets.length} sets done
                    </span>
                    <span className="font-bold text-zinc-900">
                        {liveVolume.toLocaleString()} kg lifted
                    </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-black transition-all duration-300 rounded-full"
                        style={{
                            width: allSets.length
                                ? `${(completedSetsCount / allSets.length) * 100}%`
                                : "0%",
                        }}
                    />
                </div>
            </div>

            {/* Lista med övningar */}
            <div className="space-y-4">
                {exercises.map((exercise, exIdx) => (
                    <div
                        key={exIdx}
                        className="bg-zinc-50/80 rounded-xl p-3.5 sm:p-4 border border-zinc-100"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-sm text-zinc-900 mb-3">
                                {exercise.name}
                            </h3>
                        </div>

                        {/* Sets & Reps rader */}
                        <div className="space-y-2.5">
                            {exercise.sets.map((set, setIdx) => (
                                <div
                                    key={setIdx}
                                    className="flex items-center gap-1.5 sm:gap-3 text-xs w-full"
                                >
                                    <span className="font-semibold text-zinc-400 w-10 sm:w-12 shrink-0 text-[11px] sm:text-xs">
                                        Set {setIdx + 1}
                                    </span>

                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                        <input
                                            type="number"
                                            value={set.kgs || ""}
                                            onChange={(e) =>
                                                handleSetChange(exIdx, setIdx, "kgs", e.target.value)
                                            }
                                            onBlur={() => autoSaveWorkout(exercises)}
                                            placeholder="0"
                                            className="w-full min-w-9 max-w-14 p-1.5 bg-white border border-zinc-200 rounded-lg text-center font-medium text-xs focus:outline-none focus:border-zinc-400"
                                        />
                                        <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                                            kg
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                        <input
                                            type="number"
                                            value={set.reps || ""}
                                            onChange={(e) =>
                                                handleSetChange(exIdx, setIdx, "reps", e.target.value)
                                            }
                                            onBlur={() => autoSaveWorkout(exercises)}
                                            placeholder="0"
                                            className="w-full min-w-9 max-w-14 p-1.5 bg-white border border-zinc-200 rounded-lg text-center font-medium text-xs focus:outline-none focus:border-zinc-400"
                                        />
                                        <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                                            reps
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toggleSetComplete(exIdx, setIdx)}
                                        className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs cursor-pointer transition-all active:scale-95 ${set.completed
                                            ? "bg-emerald-500 text-white shadow-xs"
                                            : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
                                            }`}
                                    >
                                        {set.completed ? "Done ✓" : "Check"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WorkoutCard;