import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import PostCard from "../components/posts/PostCard";
import CreateCommentForm from "../components/comments/CreateCommentForm";
import CommentList from "../components/comments/CommentList";

// Detaljsida för ett enskilt inlägg med kommentarer, svar och realtidsuppdateringar
function SinglePostPage({ currentUser, setCurrentUser }) {
    const { postId } = useParams();
    const [searchParams] = useSearchParams();
    const focusedCommentId = searchParams.get("commentId") || "";
    const focusedReplyId = searchParams.get("replyId") || "";

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    // Tar bort en raderad huvudkommentar från både comments-listan och post-objektet
    const removeCommentFromState = (deletedCommentId) => {
        const targetId = String(deletedCommentId);
        setComments((prev) => prev.filter((c) => String(c._id) !== targetId));
        setPost((prev) =>
            prev
                ? {
                    ...prev,
                    comments: (prev.comments || []).filter(
                        (c) => String(c?._id || c) !== targetId
                    ),
                }
                : prev
        );
    };

    // Tar bort ett raderat svar (reply) under rätt föräldrakommentar
    const removeReplyFromState = (parentCommentId, deletedReplyId) => {
        const cId = String(parentCommentId);
        const rId = String(deletedReplyId);

        const stripReply = (list) =>
            list.map((c) => {
                if (!c || typeof c !== "object" || String(c._id) !== cId) return c;
                return {
                    ...c,
                    replies: (c.replies || []).filter((r) => String(r._id) !== rId),
                };
            });

        setComments((prev) => stripReply(prev));
        setPost((prev) =>
            prev
                ? {
                    ...prev,
                    comments: stripReply(prev.comments || []),
                }
                : prev
        );
    };

    // 1. Hämtar inläggsdetaljer och kommentarer när postId (eller fokus-parametrar) ändras
    useEffect(() => {
        let isActive = true;

        const fetchPostDetails = async () => {
            setError("");
            setPost(null);
            setComments([]);
            setIsLoading(true);

            try {
                const response = await api.get(`/posts/${postId}`);
                if (!isActive) return;
                setPost(response.data.post);
                setComments(response.data.post.comments || []);
            } catch (err) {
                if (!isActive) return;
                const errorResponse = err.response?.data;
                setError(errorResponse?.message || "This post could not be found.");
                setPost(null);
                setComments([]);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        if (postId) {
            fetchPostDetails();
        }

        // Avbryter state-uppdatering om komponenten avmonteras mitt i en hämtning
        return () => {
            isActive = false;
        };
    }, [postId, focusedCommentId, focusedReplyId]);

    // 2. Lyssnar på nya och raderade kommentarer/svar i realtid via Socket.IO
    useEffect(() => {
        if (!postId) return;
        const socket = getSocket();
        const targetPostId = String(postId);

        socket.emit("joinPost", targetPostId);

        const handleCommentCreated = (payload) => {
            if (String(payload?.postId) !== targetPostId || !payload?.comment) return;

            setComments((prev) =>
                prev.some((c) => String(c._id) === String(payload.comment._id))
                    ? prev
                    : [payload.comment, ...prev]
            );

            setPost((prev) => {
                if (!prev) return prev;
                const existing = prev.comments || [];
                if (existing.some((c) => String(c?._id || c) === String(payload.comment._id))) {
                    return prev;
                }
                return {
                    ...prev,
                    comments: [payload.comment, ...existing],
                };
            });
        };

        const handleCommentReplied = (payload) => {
            if (String(payload?.postId) !== targetPostId || !payload?.commentId || !payload?.reply) return;

            const addReplyToList = (list) =>
                list.map((comment) => {
                    if (
                        !comment ||
                        typeof comment !== "object" ||
                        String(comment._id) !== String(payload.commentId)
                    ) {
                        return comment;
                    }
                    const existingReplies = comment.replies || [];
                    if (existingReplies.some((r) => String(r._id) === String(payload.reply._id))) {
                        return comment;
                    }
                    return {
                        ...comment,
                        replies: [...existingReplies, payload.reply],
                    };
                });

            setComments((prev) => addReplyToList(prev));
            setPost((prev) =>
                prev
                    ? {
                        ...prev,
                        comments: addReplyToList(prev.comments || []),
                    }
                    : prev
            );
        };

        const handleCommentDeleted = (payload) => {
            if (String(payload?.postId) !== targetPostId || !payload?.commentId) return;
            removeCommentFromState(payload.commentId);
        };

        const handleCommentReplyDeleted = (payload) => {
            if (
                String(payload?.postId) !== targetPostId ||
                !payload?.commentId ||
                !payload?.replyId
            ) {
                return;
            }
            removeReplyFromState(payload.commentId, payload.replyId);
        };

        socket.on("comment:created", handleCommentCreated);
        socket.on("comment:replied", handleCommentReplied);
        socket.on("comment:deleted", handleCommentDeleted);
        socket.on("comment:replyDeleted", handleCommentReplyDeleted);

        // Lämnar inläggets socket-rum och städar bort lyssnare vid unmount
        return () => {
            socket.emit("leavePost", targetPostId);
            socket.off("comment:created", handleCommentCreated);
            socket.off("comment:replied", handleCommentReplied);
            socket.off("comment:deleted", handleCommentDeleted);
            socket.off("comment:replyDeleted", handleCommentReplyDeleted);
        };
    }, [postId]);

    // 3. Uppdaterar inlägget vid redigering eller navigerar till /home om det raderas i realtid
    useEffect(() => {
        if (!postId) return;
        const socket = getSocket();
        const targetPostId = String(postId);

        const handlePostUpdated = (updatedPost) => {
            if (!updatedPost?._id) return;
            if (String(updatedPost._id) === targetPostId) {
                setPost(updatedPost);
            }
        };

        const handlePostDeleted = (payload) => {
            const deletedId = String(payload?.postId || payload?._id || payload || "");
            if (deletedId && deletedId === targetPostId) {
                navigate("/home");
            }
        };

        socket.on("post:updated", handlePostUpdated);
        socket.on("post:deleted", handlePostDeleted);

        // Städar bort lyssnare för uppdatering/radering av inlägget
        return () => {
            socket.off("post:updated", handlePostUpdated);
            socket.off("post:deleted", handlePostDeleted);
        };
    }, [postId, navigate]);

    // Uppdaterar lokalt inlägg efter redigering
    const handleEditPost = (updatedPost) => {
        setPost(updatedPost);
    };

    // Navigerar till /home efter att aktuellt inlägg raderats
    const handleDeletePost = () => {
        navigate("/home");
    };

    return (
        <>
            {/* Felmeddelande om inlägget inte hittades eller tagits bort */}
            {!isLoading && error && (
                <div className="max-w-lg mx-auto mt-20 px-4 text-center">
                    <p className="text-sm text-zinc-500">
                        This post is no longer available.
                    </p>
                </div>
            )}

            {/* Detaljvy med inläggskort, formulär för ny kommentar och kommentarlista */}
            {post && (
                <section className="flex-1 max-w-2xl mx-auto pt-16 xl:pt-6 pb-24 font-sans text-gray-800">
                    <PostCard
                        post={post}
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        handleEditPost={handleEditPost}
                        handleDeletePost={handleDeletePost}
                        isDetailView={true}
                    />

                    <CreateCommentForm
                        currentUser={currentUser}
                        comments={comments}
                        setComments={setComments}
                        postId={postId}
                    />

                    <CommentList
                        currentUser={currentUser}
                        comments={comments}
                        focusedCommentId={focusedCommentId}
                        focusedReplyId={focusedReplyId}
                        onCommentDeleted={removeCommentFromState}
                        onReplyDeleted={removeReplyFromState}
                    />
                </section>
            )}
        </>
    );
}

export default SinglePostPage;