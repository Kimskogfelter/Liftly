import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import { FiX } from "react-icons/fi";

function EditAccountModal({ onClose, currentUser, setCurrentUser, getUserInfo }) {
    const [username, setUsername] = useState(currentUser?.username || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Synka lokalt state om currentUser ändras externt
    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || "");
            setEmail(currentUser.email || "");
        }
    }, [currentUser]);

    // Kolla om något faktiskt har ändrats
    const hasChanges = username !== currentUser?.username || email !== currentUser?.email;

    // Knappen är aktiv om man har gjort en ändring OCH fyllt i sitt nuvarande lösenord
    const isFormValid = hasChanges && currentPassword.trim().length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);
        setError("");

        try {
            // Vi skickar med både nya uppgifterna och det nuvarande lösenordet till backend
            const response = await api.patch("/users/updateAccount", {
                username,
                email,
                currentPassword
            });

            if (response.status === 200) {
                const updatedUserFromBackend = response.data.updatedUser;

                const updatedUser = {
                    ...currentUser,
                    username: updatedUserFromBackend.username,
                    email: updatedUserFromBackend.email
                };

                setCurrentUser(updatedUser);
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));

                if (getUserInfo) await getUserInfo();

                setSuccess(true);

                setTimeout(() => {
                    onClose();
                }, 1200);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not update account details.");
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="w-full min-h-screen sm:min-h-0 sm:max-w-sm bg-white rounded-none sm:rounded-lg p-5 pt-6 sm:p-6 text-gray-800 relative shadow-none sm:shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Edit Account Details</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                        title="Close"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {success ? (
                    <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg font-medium border border-emerald-100 text-center my-4 animate-in fade-in duration-150">
                        Account details updated successfully!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3 text-left">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full text-xs text-gray-800 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full text-xs text-gray-800 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>

                        {/* Bekräfta med nuvarande lösenord */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Current Password (required to save)</label>
                            <input
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full text-xs text-gray-800 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || !isFormValid}
                                className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>,
        document.body
    );
}

export default EditAccountModal;