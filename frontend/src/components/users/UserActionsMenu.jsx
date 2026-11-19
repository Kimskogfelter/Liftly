import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiFlag, FiX } from "react-icons/fi";
import ReportUserModal from "./ReportUserModal";

function UserActionsMenu({ targetUser, currentUser, closeMenu }) {
    const [showReportUserModal, setShowReportUserModal] = useState(false);

    const backdropClasses = "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200";

    return (
        <>
            {!showReportUserModal && createPortal(
                <div
                    className={backdropClasses}
                    onClick={closeMenu}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-lg p-6 text-gray-800 relative animate-in zoom-in-95 duration-150 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                    Profile Options
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Actions for @{targetUser?.username}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeMenu}
                                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 my-2">
                            <button
                                type="button"
                                onClick={() => setShowReportUserModal(true)}
                                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-xs text-gray-700 group-hover:scale-105 transition-transform">
                                        <FiFlag size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Report User</p>
                                        <p className="text-[10px] text-gray-400">Flag inappropriate profile</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ReportUserModal 
                isOpen={showReportUserModal}
                userId={targetUser?._id}
                username={targetUser?.username}
                onClose={() => {
                    setShowReportUserModal(false);
                    closeMenu();
                }} 
            />
        </>
    );
}

export default UserActionsMenu;