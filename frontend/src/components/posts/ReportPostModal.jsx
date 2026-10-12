import { useState } from "react";
import api from "../../api/axios";

function ReportPostModal({ postId, onClose }) {
    const [reason, setReason] = useState("Inappropriate content");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post(`/posts/${postId}/report`, { reason });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError("Could not send report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
            <div className="w-full max-w-sm bg-white rounded-lg p-5 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                <h3 className="text-sm font-bold text-gray-900 mb-2 text-left">Report Post</h3>
                <p className="text-xs text-gray-500 mb-4 text-left">
                    Thank you for helping keep the platform safe. Why are you reporting this post?
                </p>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-medium text-center">
                        Thank you! Your report has been submitted.
                    </div>
                ) : (
                    <form onSubmit={handleReport} className="space-y-3">
                        <div className="space-y-2 text-xs text-left">
                            {[
                                "Inappropriate content",
                                "Harassment or bullying",
                                "Spam or fake accounts",
                                "Violence or threats"
                            ].map((item) => (
                                <label key={item} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={item}
                                        checked={reason === item}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="accent-black"
                                    />
                                    <span className="text-gray-700 font-medium">{item}</span>
                                </label>
                            ))}
                        </div>

                        {error && <div className="text-red-600 text-xs">{error}</div>}

                        <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-1.5 px-3 rounded-md transition-colors cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-md transition-colors cursor-pointer text-xs shadow-sm disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Report"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ReportPostModal;