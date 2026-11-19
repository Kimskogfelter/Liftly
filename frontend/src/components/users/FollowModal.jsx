import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ProfileImage from './ProfileImage';
import { handleFollowUserToggle } from '../../functions/user/handleFollowUserToggle';
import { IoClose } from 'react-icons/io5';

export const FollowModal = ({
    userId,
    username,
    type,
    followersCount,
    followingCount,
    isOpen,
    onClose,
    currentUser,
    setCurrentUser
}) => {
    const [activeTab, setActiveTab] = useState(type || 'followers');
    const [usersByTab, setUsersByTab] = useState({
        following: null,
        followers: null
    });
    const [loading, setLoading] = useState(false);

    // Nollställ cache när modalen öppnas eller användare byts
    useEffect(() => {
        if (!isOpen) return;
        setUsersByTab({ following: null, followers: null });
        if (type) {
            setActiveTab(type);
        }
    }, [userId, type, isOpen]);

    // Hämta användare för vald flik utan att rensa befintlig lista
    useEffect(() => {
        if (!isOpen || !userId) return;

        let isCancelled = false;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/users/${userId}/${activeTab}`);
                if (isCancelled) return;

                const userList = activeTab === 'following'
                    ? response.data.followingUsers
                    : response.data.followerUsers;

                setUsersByTab((prev) => ({
                    ...prev,
                    [activeTab]: userList || []
                }));
            } catch (error) {
                // console.error(`Could not fetch ${activeTab}:`, error);
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isCancelled = true;
        };
    }, [userId, activeTab, isOpen]);

    if (!isOpen) return null;

    const currentUsers = usersByTab[activeTab] || [];
    const hasLoadedCurrentTab = usersByTab[activeTab] !== null;

    const setCurrentTabUsers = (updater) => {
        setUsersByTab((prev) => ({
            ...prev,
            [activeTab]: typeof updater === 'function' ? updater(prev[activeTab] || []) : updater
        }));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full h-full sm:h-auto sm:max-w-sm sm:max-h-[80vh] rounded-none sm:rounded-xl shadow-xl overflow-hidden flex flex-col font-sans"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative flex items-center justify-center px-5 pt-6 pb-3 sm:pt-4 border-b border-gray-50 sm:border-none">
                    <h3 className="font-bold text-base text-gray-900 truncate max-w-[75%]">
                        {username ? `@${username}` : 'Connections'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-5 sm:top-3.5 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Flikar (TikTok-stil) */}
                <div className="flex border-b border-gray-100 relative">
                    <button
                        type="button"
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 py-3 sm:py-2.5 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
                            activeTab === 'following'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Following {followingCount !== undefined && `(${followingCount})`}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 py-3 sm:py-2.5 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
                            activeTab === 'followers'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Followers {followersCount !== undefined && `(${followersCount})`}
                    </button>

                    {/* Diskret laddningslinje under flikarna */}
                    {loading && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 overflow-hidden">
                            <div className="h-full w-1/2 bg-black animate-pulse"></div>
                        </div>
                    )}
                </div>

                {/* Body / User List */}
                <div className="p-4 overflow-y-auto flex-1 min-h-45">
                    {loading && !hasLoadedCurrentTab ? (
                        <div className="py-10 text-center text-xs text-gray-400">
                            Loading...
                        </div>
                    ) : currentUsers.length === 0 ? (
                        <div className="py-10 text-center text-xs text-gray-400">
                            {activeTab === 'following' ? 'Not following anyone yet.' : 'No followers yet.'}
                        </div>
                    ) : (
                        <ul className={`divide-y divide-gray-50 transition-opacity duration-150 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                            {currentUsers.map((targetUser) => {
                                const isAlreadyFollowing = currentUser?.following?.some(
                                    (id) => (id._id || id).toString() === targetUser._id.toString()
                                ) || false;

                                const currentUserId = currentUser?.id || currentUser?._id;
                                const isSelf = currentUserId ? currentUserId.toString() === targetUser._id.toString() : false;

                                return (
                                    <li key={targetUser._id} className="py-2.5 flex items-center justify-between gap-3">
                                        <Link
                                            to={`/users/${targetUser._id}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 min-w-0 flex-1 p-1 -mx-1 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-gray-100">
                                                <ProfileImage profileImage={targetUser.profileImage} />
                                            </div>
                                            <span className="font-semibold text-sm text-gray-900 truncate">
                                                @{targetUser.username}
                                            </span>
                                        </Link>

                                        {!isSelf && (
                                            <button
                                                type="button"
                                                onClick={() => handleFollowUserToggle(targetUser, setCurrentTabUsers, currentUser, setCurrentUser, isAlreadyFollowing)}
                                                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                                                    isAlreadyFollowing
                                                        ? "bg-gray-100 hover:bg-gray-200 text-black border border-gray-200"
                                                        : "bg-black hover:bg-zinc-800 text-white"
                                                }`}
                                            >
                                                {isAlreadyFollowing ? "Following" : "Follow"}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};