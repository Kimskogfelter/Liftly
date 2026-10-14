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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-lg p-6 text-gray-800 relative shadow-xl" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Change Password</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
            <FiX size={18} />
          </button>
        </div>

        {success ? (
          <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-lg font-medium border border-emerald-100 text-center my-4">
            Password updated successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs text-gray-800 border border-zinc-200 rounded-lg p-2.5 bg-gray-50/30 focus:outline-none focus:border-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs text-gray-800 border border-zinc-200 rounded-lg p-2.5 bg-gray-50/30 focus:outline-none focus:border-zinc-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs text-gray-800 border border-zinc-200 rounded-lg p-2.5 bg-gray-50/30 focus:outline-none focus:border-zinc-400"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-1.5 px-3.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3A3939] hover:bg-zinc-800 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
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