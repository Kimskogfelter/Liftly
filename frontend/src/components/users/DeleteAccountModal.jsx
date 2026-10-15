import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function DeleteAccountModal({ onClose, currentUser, setCurrentUser }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const backdropClasses =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200";

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError("");

    try {
      await api.delete(`/users/${currentUser._id || currentUser.id}`);

      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      onClose();
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete your account. Please try again."
      );
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div className={backdropClasses}>
      <div
        className="w-full max-w-sm bg-white rounded-lg p-6 text-gray-800 relative animate-in zoom-in-95 duration-150"
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

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-2xl mb-4 border border-red-100 text-left font-medium">
            {error}
          </div>
        )}

        {/* Bekräftelsevy */}
        <div className="space-y-4 text-left my-2">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-3.5 rounded-2xl text-amber-800">
            <FiAlertTriangle size={20} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Are you sure you want to delete your account? This action cannot be undone and all your posts will be permanently removed.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer text-xs shadow-xs disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Yes, delete account"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteAccountModal;