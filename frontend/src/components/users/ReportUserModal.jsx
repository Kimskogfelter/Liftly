import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import api from "../../api/axios";

const ReportUserModal = ({ isOpen, onClose, userId, username }) => {
    const reasons = [
        'Inappropriate profile or behavior',
        'Spam or fake account',
        'Harassment or bullying',
        'Other'
    ];

    const [reason, setReason] = useState(reasons[0]);
    const [details, setDetails] = useState(''); // Nytt state för detaljer
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Skickar med både reason och details
            await api.post(`/users/${userId}/report`, { reason, details });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setDetails(''); // Rensa fältet
                onClose();
            }, 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not report user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
            onClick={onClose}
        >
            <div
                className="w-full min-h-screen sm:min-h-0 sm:max-w-md bg-white rounded-none sm:rounded-lg p-5 pt-6 sm:p-6 text-gray-800 relative shadow-none sm:shadow-xl animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="text-left">
                        <h3 className="text-base font-bold text-gray-900 tracking-tight">
                            Report User @{username}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Thank you for helping keep the platform safe. Why are you reporting this profile?
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                        title="Close"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-medium text-center border border-green-100">
                        Thank you! Your report has been submitted.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-100 text-left">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5 my-2 text-left">
                            {reasons.map((item) => (
                                <label
                                    key={item}
                                    className="flex items-center gap-3 text-xs font-medium text-gray-800 cursor-pointer hover:bg-gray-50 p-2.5 rounded-lg border border-transparent hover:border-zinc-200 transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={item}
                                        checked={reason === item}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-4 h-4 text-black border-gray-300 cursor-pointer accent-black"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>

                        {/* Extra textfält för detaljer */}
                        <div className="space-y-1 text-left">
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                Additional details <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Provide any extra context..."
                                className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-gray-50/30 focus:outline-none focus:border-zinc-400 resize-none h-20 text-gray-800"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all text-xs cursor-pointer disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReportUserModal;