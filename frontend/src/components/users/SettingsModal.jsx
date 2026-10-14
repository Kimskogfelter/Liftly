import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import ContactModal from "./ContactModal";
import DeleteAccountModal from "./DeleteAccountModal";
import { FiTrash2, FiX, FiMail, FiShield } from "react-icons/fi";

function SettingsModal({ onClose, currentUser, setCurrentUser }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const navigate = useNavigate();

  const backdropClasses =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200";

  return createPortal(
    <div className={backdropClasses} onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white rounded-lg p-6 text-gray-800 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-left text-gray-900">
              Account Settings
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 text-left">
              Manage your preferences
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Huvudmeny */}
        <div className="flex flex-col gap-2 my-2">

          {/* Contact & Feedback */}
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-gray-700 group-hover:scale-105 transition-transform">
                <FiMail size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Contact & Feedback</p>
                <p className="text-[10px] text-gray-500">
                  Report bugs, share ideas or collaborations
                </p>
              </div>
            </div>
          </button>

          {/* Privacy Policy */}
          <button
            type="button"
            onClick={() => {
              navigate("/privacy");
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-gray-700 group-hover:scale-105 transition-transform">
                <FiShield size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Privacy Policy</p>
                <p className="text-[10px] text-gray-500">
                  Read our data protection and GDPR terms
                </p>
              </div>
            </div>
          </button>

          {/* Delete Account */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-3.5 bg-red-50/60 hover:bg-red-50 rounded-2xl transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-red-500 group-hover:scale-105 transition-transform">
                <FiTrash2 size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-red-600">Delete Account</p>
                <p className="text-[10px] text-red-400">
                  Permanently remove your account and data
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modaler som renderas vid behov */}
      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}
    </div>,
    document.body
  );
}

export default SettingsModal;