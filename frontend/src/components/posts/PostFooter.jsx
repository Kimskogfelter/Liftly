import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiBookmark, FiMessageCircle } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';

// Bottenrad för ett inläggskort med gilla-, kommentar- och sparaknapp
const PostFooter = ({
    post,
    isLiked,
    likesCount,
    isSaved,
    commentsCount,
    handlePostLikeToggle,
    handleSavePost
}) => {
    return (
        <div>
            <hr className="border-gray-100 my-2" />

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-5">
                    {/* Gilla-knapp (skickar utloggade till /login via handlePostLikeToggle) */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            className={`text-lg cursor-pointer transition-transform active:scale-90 ${isLiked ? "text-red-500" : "text-black hover:text-gray-600"}`}
                            onClick={handlePostLikeToggle}
                        >
                            {isLiked ? <FiHeart className="fill-red-500 text-red-500" size={18} /> : <FiHeart size={18} />}
                        </button>
                        <span className="font-medium text-xs text-gray-700">{likesCount}</span>
                    </div>

                    {/* Länk till inläggets detaljvy och kommentarer */}
                    <Link to={`/posts/${post._id}`} className="flex items-center gap-1.5 text-black hover:text-gray-600 text-lg">
                        <FiMessageCircle size={18} />
                        <span className="font-medium text-xs text-gray-700">
                            {commentsCount}
                        </span>
                    </Link>
                </div>

                {/* Spara-knapp (skickar utloggade till /login via handleSavePost) */}
                <button
                    type="button"
                    onClick={handleSavePost}
                    className="text-lg text-black hover:text-gray-600 cursor-pointer"
                >
                    {isSaved ? <FaBookmark size={18} /> : <FiBookmark size={18} />}
                </button>
            </div>
        </div>
    );
};

export default PostFooter;