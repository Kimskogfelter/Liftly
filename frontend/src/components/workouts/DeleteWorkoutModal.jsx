import React, { useState } from "react";
import api from "../../api/axios";
import { IoClose } from "react-icons/io5";

function DeleteWorkoutModal({ workout, currentUser, onClose, handleDeleteWorkout }) {

    const [isDeleting, setIsDeleting] = useState(false);

    const removeWorkout = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/workouts/${workout._id}`);

            handleDeleteWorkout(workout._id);
            onClose();
        } catch (err) {
            // console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
            onClick={onClose}
        >
            <div
                className="bg-white p-5 rounded-lg max-w-sm w-full shadow-xl border border-gray-100 text-left animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-gray-900">Delete Workout?</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                        title="Close"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                <p className="text-xs text-zinc-500 mb-4">
                    Are you sure you want to delete "{workout.title}"?
                </p>

                <div className="pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={removeWorkout}
                        disabled={isDeleting}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all text-xs cursor-pointer disabled:opacity-50"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteWorkoutModal;