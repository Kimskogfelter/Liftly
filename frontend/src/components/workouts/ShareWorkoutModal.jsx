import React, { useState } from "react";
import api from "../../api/axios";
import { IoClose } from "react-icons/io5";

function ShareWorkoutModal({ workoutData, onClose, onShared }) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handlePublish = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError("Please add a caption before sharing your workout.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("content", content.trim());
            formData.append("category", "Training");
            formData.append("workoutShare", JSON.stringify(workoutData));

            const response = await api.post("/posts/create", formData);

            if (response.status === 201) {
                window.dispatchEvent(new Event("postCreated"));
                onShared?.();
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not share workout. Please try again."
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto font-sans"
            onClick={onClose}
        >
            <div
                className="w-full min-h-screen sm:min-h-0 sm:max-w-md bg-white rounded-none sm:rounded-lg p-5 pt-6 sm:p-5 shadow-none sm:shadow-2xl border-0 sm:border border-gray-100 text-left relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Share Workout Session</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                        title="Close"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                <form onSubmit={handlePublish} className="space-y-3">
                    <textarea
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="Add a caption"
                        autoFocus
                        className="w-full h-20 text-xs text-gray-800 border border-zinc-200 rounded-lg p-3 resize-none focus:outline-none focus:border-zinc-400 bg-gray-50/30"
                    ></textarea>

                    {/* Förhandsgranskning av slutfört pass */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-gray-800 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-zinc-900">{workoutData?.title}</span>
                            {workoutData?.date && (
                                <span className="text-[10px] font-medium text-zinc-400">
                                    {workoutData.date}
                                </span>
                            )}
                        </div>

                        <div className="bg-white border border-zinc-200/80 rounded-lg p-3">
                            <p className="text-[10px] font-semibold text-zinc-400">Total weight lifted</p>
                            <p className="text-xl font-bold text-zinc-900 mt-0.5">
                                {Number(workoutData?.totalVolume || 0).toLocaleString()} kg
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-1">
                                {workoutData?.exercisesCount ?? 0} exercises · {workoutData?.completedSetsCount ?? 0}/{workoutData?.totalSetsCount ?? 0} sets completed
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-[11px] p-2.5 rounded-lg font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50"
                        >
                            {isSubmitting ? "Sharing..." : "Share to Feed"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ShareWorkoutModal;