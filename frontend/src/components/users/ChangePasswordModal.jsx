import React, { useState } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios";
import { FiX } from "react-icons/fi";

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Knappen "update password" aktiveras så fort alla tre fält har text i sig
  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.patch("/users/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not change password.");
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
          <h3 className="text-base font-bold text-gray-900">Change Password</h3>
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
          <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg font-medium border border-emerald-100 text-center my-4">
            Password updated successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs text-gray-800 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs text-gray-800 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>,
    document.body
  );
}

export default ChangePasswordModal;