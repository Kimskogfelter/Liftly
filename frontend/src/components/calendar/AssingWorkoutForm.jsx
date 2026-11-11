import React from 'react';
import { FiPlus } from "react-icons/fi";

const AssignWorkoutForm = ({
    selectedDate,
    selectedWorkoutId,
    setSelectedWorkoutId,
    workouts,
    handleAssignWorkout,
    notes,
    setNotes,
    handleSaveDayNote
}) => {
    return (
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm mb-6">
            <div className="mb-4 pb-3 border-b border-zinc-100 flex items-center justify-between">
                <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Selected Date</span>
                    <h2 className="text-base font-bold text-zinc-900 mt-0.5 font-mono">{selectedDate}</h2>
                </div>
            </div>

            {/* Fristående dagsnotering / status */}
            <div className="mb-6 pb-5 border-b border-zinc-100 space-y-2">
                <h2 className="font-semibold text-zinc-900 text-xs">Note</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="E.g. Sick, rest day... (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-1 border border-zinc-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                        type="button"
                        onClick={handleSaveDayNote}
                        disabled={!notes}
                        className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 disabled:bg-zinc-300 transition text-xs cursor-pointer shadow-xs"
                    >
                        Save Note
                    </button>
                </div>
            </div>

            {/* Sektion för att boka ett träningspass */}
            <form onSubmit={handleAssignWorkout} className="space-y-3">
                <h2 className="font-semibold text-zinc-900 text-xs">Assign Workout</h2>
                
                <select
                    value={selectedWorkoutId}
                    onChange={(e) => setSelectedWorkoutId(e.target.value)}
                    className="w-full border border-zinc-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                    <option value="">Select from your workouts...</option>
                    {workouts.map((w) => (
                        <option key={w._id} value={w._id}>
                            {w.title}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    disabled={!selectedWorkoutId}
                    className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 disabled:bg-zinc-300 transition text-xs shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                    <FiPlus size={16} />
                    <span>Add Workout to Calendar</span>
                </button>
            </form>
        </div>
    );
};

export default AssignWorkoutForm;