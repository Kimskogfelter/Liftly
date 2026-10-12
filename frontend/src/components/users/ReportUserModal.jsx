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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                    <IoClose size={22} />
                </button>

                <h3 className="text-base font-bold text-gray-900 tracking-tight mb-1 text-left">
                    Report User @{username}
                </h3>
                <p className="text-xs text-gray-500 mb-4 text-left">
                    Thank you for helping keep the platform safe. Why are you reporting this profile?
                </p>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs font-medium text-center">
                        Thank you! Your report has been submitted.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2 my-2 text-left">
                            {reasons.map((item) => (
                                <label 
                                    key={item} 
                                    className="flex items-center gap-3 text-xs font-medium text-gray-800 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={item}
                                        checked={reason === item}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-4 h-4 text-red-600 border-gray-300 cursor-pointer"
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>

                        {/* Extra textfält för detaljer */}
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-semibold text-gray-700">
                                Additional details <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Provide any extra context..."
                                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none h-16 text-gray-800"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
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