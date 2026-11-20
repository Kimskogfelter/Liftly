import { Capacitor } from '@capacitor/core';
import { FiX, FiBell, FiCheck } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api/axios';

function NotificationModal({ currentUser, notifications, setNotifications, unreadCount, setUnreadCount, onClose }) {

    const navigate = useNavigate();
    const isMobileApp = Capacitor.isNativePlatform();
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredNotifications = notifications.filter(notif => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'likes' && notif.type === 'like') return true;
        if (activeFilter === 'comments' && notif.type === 'comment') return true;
        if (activeFilter === 'follows' && notif.type === 'follow') return true;
        return false;
    });

    const handleNotificationClick = async (notif) => {

        console.log("Klickad notis:", notif);
        // Markera som läst om den är oläst
        if (!notif.read) {
            try {
                await api.put(`/notifications/${notif._id}/read`);
                setNotifications(prev =>
                    prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.log("Kunde inte markera notis som läst", err);
            }
        }

        // Stäng modalen först
        onClose();

        // Navigera baserat på notis-typ
        if (notif.type === 'like' || notif.type === 'comment') {
            if (notif.post) {
                const postId = String(notif.post._id || notif.post);
                const commentId = notif.comment ? String(notif.comment._id || notif.comment) : "";
                const replyId = notif.replyId ? String(notif.replyId) : "";

                const params = new URLSearchParams();
                if (commentId) params.set("commentId", commentId);
                if (replyId) params.set("replyId", replyId);

                const query = params.toString();
                navigate(query ? `/posts/${postId}?${query}` : `/posts/${postId}`);
            }
        } else if (notif.type === 'follow') {
            if (notif.sender?._id) {
                navigate(`/users/${notif.sender._id}`);
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.log("Kunde inte markera alla som lästa", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Bakgrundstoning */}
            <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs xl:bg-transparent" />

            {/* Slimmad panel som döljer/slukar navbaren på desktop */}
            <div className="relative z-10 bg-[#121214] border-r xl:border border-zinc-800 w-full h-full xl:h-screen xl:w-72 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-left duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-2 text-zinc-200">
                        <h3 className="font-bold text-base">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg"
                            >
                                <FiCheck size={12} />
                                <span>Mark all</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Close"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* Filter Badges (TikTok-stil med tydligare kontrast) */}
                <div className="px-3 py-3 border-b border-zinc-800/60 flex items-center justify-center gap-1.5 flex-wrap shrink-0">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'likes', label: 'Likes' },
                        { id: 'comments', label: 'Comments' },
                        { id: 'follows', label: 'Follows' }
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm ${activeFilter === filter.id
                                ? 'bg-white text-black scale-[1.02]'
                                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                <div className="p-3 overflow-y-auto space-y-2 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500 text-xs">
                            <FiBell size={28} className="mx-auto mb-2 opacity-30" />
                            <p>No notifications to show</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${notif.read
                                    ? 'bg-zinc-900/30 border-zinc-800/50 text-zinc-400'
                                    : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-zinc-600'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-700">
                                    {notif.sender?.profileImage ? (
                                        <img src={notif.sender.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <FiBell size={14} className="text-zinc-400" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs leading-relaxed text-zinc-200">
                                        <span className="font-semibold">{notif.sender?.username || "Someone"}</span> {notif.message}
                                    </p>
                                    <span className="text-[10px] text-zinc-500 mt-1 block">
                                        {new Date(notif.createdAt).toLocaleDateString()} kl {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {!notif.read && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

export default NotificationModal;