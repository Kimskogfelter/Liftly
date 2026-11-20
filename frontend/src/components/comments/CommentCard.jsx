import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { getSocket } from "../../api/socket";
import ProfileImage from "../users/ProfileImage";
import CommentReplyItem from "./CommentReplyItem";
import DeleteCommentModal from "./DeleteCommentModal";
import { handleCommentLikeToggle } from "../../functions/comments/handleCommentLikeToggle";
import { FiHeart } from "react-icons/fi";
import TimeAgo from "react-timeago";

function CommentCard({
    comment,
    currentUser,
    focusedCommentId = "",
    focusedReplyId = "",
    highlightedId = "",
    onCommentDeleted,
    onReplyDeleted,
}) {
    const currentUserId = String(currentUser?.id || currentUser?._id || "");
    const commentOwnerId = String(comment.createdBy?._id || comment.createdBy || "");
    const isCommentOwner = Boolean(currentUserId && commentOwnerId === currentUserId);

    const [isLiked, setIsLiked] = useState(
        comment.likes?.map(String).includes(currentUserId) || false
    );
    const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replyToUser, setReplyToUser] = useState("");
    const [replies, setReplies] = useState(comment.replies || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyError, setReplyError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setReplies(comment.replies || []);
    }, [comment._id, comment.replies]);

    useEffect(() => {
        setLikesCount(comment.likes?.length || 0);
        setIsLiked(
            Boolean(currentUserId && comment.likes?.map(String).includes(currentUserId))
        );
    }, [comment._id, comment.likes, currentUserId]);

    // Lyssna på nya och raderade replies i realtid för denna kommentar
    useEffect(() => {
        if (!comment?._id) return;
        const socket = getSocket();
        const commentId = String(comment._id);

        const handleReplyAdded = (payload) => {
            if (String(payload?.commentId) !== commentId || !payload?.reply) return;

            setReplies((prev) =>
                prev.some((r) => String(r._id) === String(payload.reply._id))
                    ? prev
                    : [...prev, payload.reply]
            );
        };

        const handleReplyDeleted = (payload) => {
            if (String(payload?.commentId) !== commentId || !payload?.replyId) return;
            setReplies((prev) =>
                prev.filter((r) => String(r._id) !== String(payload.replyId))
            );
        };

        socket.on("comment:replied", handleReplyAdded);
        socket.on("comment:replyDeleted", handleReplyDeleted);
        return () => {
            socket.off("comment:replied", handleReplyAdded);
            socket.off("comment:replyDeleted", handleReplyDeleted);
        };
    }, [comment?._id]);

    const handleReplyToComment = () => {
        const username = comment.createdBy?.username || "";
        setReplyToUser(username);
        setReplyContent(`@${username} `);
        setShowReplyInput(true);
    };

    const handleReplyToReply = (targetReply) => {
        const username = targetReply.createdBy?.username || "";
        setReplyToUser(username);
        setReplyContent(`@${username} `);
        setShowReplyInput(true);
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        setReplyError("");

        try {
            const response = await api.post(`/posts/comments/${comment._id}/reply`, {
                content: replyContent,
            });

            const createdReply = response.data.reply;
            if (createdReply) {
                setReplies((prev) =>
                    prev.some((r) => String(r._id) === String(createdReply._id))
                        ? prev
                        : [...prev, createdReply]
                );
            }

            setReplyContent("");
            setReplyToUser("");
            setShowReplyInput(false);
        } catch (err) {
            const errorResponse = err.response?.data;
            setReplyError(errorResponse?.message || "Could not add reply. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLocalReplyDeleted = (deletedReplyId) => {
        setReplies((prev) =>
            prev.filter((r) => String(r._id) !== String(deletedReplyId))
        );
        if (onReplyDeleted) {
            onReplyDeleted(comment._id, deletedReplyId);
        }
    };

    const isCommentHighlighted =
        !focusedReplyId && String(comment._id) === String(highlightedId);

    return (
        <section
            id={`comment-${comment._id}`}
            className="scroll-mt-24 w-full max-w-lg mx-auto p-3 rounded-xl font-sans text-left border-b border-gray-50 flex flex-col gap-2 bg-white"
        >
            {/* HUVUDKOMMENTAR */}
            <div
                className={`flex items-start gap-3 p-2 -m-2 rounded-xl transition-colors duration-700 ease-out ${
                    isCommentHighlighted ? "bg-gray-100" : "bg-transparent"
                }`}
            >
                <div className="w-8 h-8 rounded-full overflow-hidden object-cover shrink-0">
                    <ProfileImage profileImage={comment.createdBy?.profileImage} />
                </div>

                <div className="flex-1 text-left min-w-0">
                    <div className="text-xs text-gray-800 leading-relaxed wrap-break-word">
                        <Link
                            to={`/users/${comment.createdBy?._id}`}
                            className="font-bold text-black hover:underline mr-1.5 inline-block"
                        >
                            {comment.createdBy?.username}
                        </Link>
                        <span>{comment.content}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-1 font-medium">
                        <span>
                            <TimeAgo date={comment.createdAt} />
                        </span>
                        <button
                            onClick={() => {
                                if (showReplyInput) {
                                    setShowReplyInput(false);
                                    setReplyContent("");
                                } else {
                                    handleReplyToComment();
                                }
                            }}
                            className="hover:text-gray-600 transition-colors cursor-pointer font-semibold"
                        >
                            {showReplyInput ? "Cancel" : "Reply"}
                        </button>

                        {isCommentOwner && (
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="hover:text-red-500 transition-colors cursor-pointer font-semibold"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                {/* LIKE-KNAPP FÖR HUVUDKOMMENTAR */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <span
                        className={`text-[10px] font-semibold ${
                            isLiked ? "text-red-500" : "text-gray-500"
                        }`}
                    >
                        {likesCount}
                    </span>

                    <button
                        className="cursor-pointer transition-transform active:scale-90"
                        onClick={() =>
                            handleCommentLikeToggle(
                                isLiked,
                                setIsLiked,
                                setLikesCount,
                                comment,
                                currentUser
                            )
                        }
                    >
                        <FiHeart
                            size={13}
                            className={
                                isLiked
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-500 stroke-[2.2] hover:text-black transition-colors"
                            }
                        />
                    </button>
                </div>
            </div>

            {/* FORMULÄR FÖR SVAR */}
            {showReplyInput && (
                <form
                    onSubmit={handleSendReply}
                    className="pl-11 pr-2 flex gap-2 items-center my-1.5 animate-in fade-in duration-150 relative"
                >
                    <input
                        type="text"
                        placeholder={`Replying to @${replyToUser}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-1 text-xs bg-gray-100/70 focus:bg-gray-100 rounded-full px-3.5 py-1.5 focus:outline-none transition-all placeholder:text-gray-400"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !replyContent.trim()}
                        className="text-xs font-bold text-black hover:text-gray-600 disabled:opacity-30 cursor-pointer transition-opacity"
                    >
                        {isSubmitting ? "Post..." : "Post"}
                    </button>

                    {replyError && (
                        <p className="absolute left-11 -bottom-4 text-[10px] text-red-500 font-medium">
                            {replyError}
                        </p>
                    )}
                </form>
            )}

            {/* LISTA ÖVER SVAR (REPLIES) */}
            {replies.length > 0 && (
                <div className="pl-6 space-y-2 mt-1 border-l-2 border-gray-100 ml-3">
                    {replies.map((reply) => {
                        const isReplyHighlighted =
                            Boolean(focusedReplyId) &&
                            String(reply._id) === String(highlightedId);

                        return (
                            <div
                                key={reply._id}
                                id={`reply-${reply._id}`}
                                className={`scroll-mt-24 p-2 rounded-xl transition-colors duration-700 ease-out ${
                                    isReplyHighlighted ? "bg-gray-100" : "bg-transparent"
                                }`}
                            >
                                <CommentReplyItem
                                    reply={reply}
                                    comment={comment}
                                    currentUser={currentUser}
                                    handleReplyToReply={handleReplyToReply}
                                    onReplyDeleted={handleLocalReplyDeleted}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* BEKRÄFTELSEMODAL FÖR RADERING AV HUVUDKOMMENTAR */}
            {showDeleteModal && (
                <DeleteCommentModal
                    targetType="comment"
                    commentId={comment._id}
                    onClose={() => setShowDeleteModal(false)}
                    onDeleted={(deletedId) => {
                        if (onCommentDeleted) {
                            onCommentDeleted(deletedId);
                        }
                    }}
                />
            )}
        </section>
    );
}

export default CommentCard;