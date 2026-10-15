import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle } from "react-icons/fi";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function DeleteAccountModal({ onClose, currentUser, setCurrentUser }) {
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const backdropClasses =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200";

  const isFormValid = password.trim().length > 0;

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsDeleting(true);
    setError("");

    try {
      await api.delete(`/users/${currentUser._id || currentUser.id}`, {
        data: { password }
      });

      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      onClose();
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete your account. Please check your password and try again."
      );
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div className={backdropClasses}>
      <div
        className="w-full max-w-sm bg-white rounded-lg p-6 text-gray-800 relative shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-left text-red-600">
              Delete Account
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 text-left">
              This action is permanent
            </p>
          </div>
        </div>

        <form onSubmit={handleDeleteAccount} className="space-y-3 text-left">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-amber-800">
            <FiAlertTriangle size={20} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Are you sure you want to delete your account? This action cannot be undone and all your posts and data will be permanently removed.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Enter your password to confirm
            </label>
            <input
              type="password"
              placeholder="Your current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-xs text-gray-800 border border-zinc-200 rounded-lg p-2.5 bg-gray-50/30 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {/* Exakt samma stil på error-rutan som i EditAccountModal */}
          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-1.5 px-3.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !isFormValid}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Yes, delete account"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default DeleteAccountModal;