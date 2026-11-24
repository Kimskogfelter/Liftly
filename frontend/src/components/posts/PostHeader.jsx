import React from 'react';
import { Link } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import ProfileImage from '../users/ProfileImage';
import PostActionsMenu from './PostActionsMenu';
import { BsThreeDots } from 'react-icons/bs';
import { FiX } from 'react-icons/fi';

// Visar inläggets topprad med författare, tidpunkt, kategori och åtgärdsknapp
const PostHeader = ({
    post,
    currentUser,
    displayCategory,
    showPostActions,
    setShowPostActions,
    handleEditPost,
    handleDeletePost,
    customTimeFormatter,
    requireAuth
}) => {
    // Öppnar/stänger åtgärdsmenyn om användaren är inloggad, annars omdirigeras till /login
    const handleToggleActions = () => {
        if (requireAuth) {
            requireAuth(() => setShowPostActions((prev) => !prev));
            return;
        }
        setShowPostActions((prev) => !prev);
    };

    return (
        <div className="flex items-center justify-between mb-3 gap-2">
            {/* Vänster sida: profilbild, användarnamn med länk till profil och relativ tid */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <ProfileImage profileImage={post.createdBy?.profileImage} />
                </div>
                <div className="flex items-center gap-1.5 min-w-0 text-xs">
                    <Link to={`/users/${post.createdBy?._id}`} className="font-bold text-black hover:underline tracking-wide truncate">
                        {post.createdBy?.username}
                    </Link>
                    <span className="text-gray-400 shrink-0">•</span>
                    <span className="text-[11px] text-gray-400 shrink-0 font-medium">
                        <TimeAgo date={post.createdAt} formatter={customTimeFormatter} />
                    </span>
                </div>
            </div>

            {/* Höger sida: kategorimärke och knapp för inläggsåtgärder (...) */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {displayCategory}
                </span>

                <div className="relative flex items-center justify-center">
                    {/* Popup-meny med åtgärder (t.ex. redigera, ta bort eller rapportera) */}
                    {showPostActions && (
                        <div className="absolute right-9 top-1/2 -translate-y-1/2 z-35 flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-md whitespace-nowrap">
                            <PostActionsMenu
                                currentUser={currentUser}
                                post={post}
                                handleEditPost={handleEditPost}
                                handleDeletePost={handleDeletePost}
                                closeMenu={() => setShowPostActions(false)}
                            />
                        </div>
                    )}

                    {/* Knapp med tre punkter (eller kryss när menyn är öppen) */}
                    <button
                        type="button"
                        className={`p-1 rounded-full transition-colors cursor-pointer text-gray-500 hover:bg-gray-100 z-10 ${showPostActions ? 'bg-gray-100 text-black' : ''}`}
                        onClick={handleToggleActions}
                    >
                        {showPostActions ? <FiX size={16} /> : <BsThreeDots size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostHeader;