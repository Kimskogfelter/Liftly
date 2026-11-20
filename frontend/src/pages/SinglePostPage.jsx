import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import PostCard from "../components/posts/PostCard";
import CreateCommentForm from "../components/comments/CreateCommentForm";
import CommentList from "../components/comments/CommentList";

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

    // 1. Hämta inläggsdetaljer och kommentarer (och rensa gammalt fel vid ny navigation)
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

        return () => {
            isActive = false;
        };
    }, [postId, focusedCommentId, focusedReplyId]);

    // 2. Lyssna på nya kommentarer och svar i realtid via rummet post:${postId}
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
        };

        const handleCommentReplied = (payload) => {
            if (String(payload?.postId) !== targetPostId || !payload?.commentId || !payload?.reply) return;

            setComments((prev) =>
                prev.map((comment) => {
                    if (String(comment._id) !== String(payload.commentId)) return comment;
                    const existingReplies = comment.replies || [];
                    if (existingReplies.some((r) => String(r._id) === String(payload.reply._id))) {
                        return comment;
                    }
                    return {
                        ...comment,
                        replies: [...existingReplies, payload.reply],
                    };
                })
            );
        };

        socket.on("comment:created", handleCommentCreated);
        socket.on("comment:replied", handleCommentReplied);

        return () => {
            socket.emit("leavePost", targetPostId);
            socket.off("comment:created", handleCommentCreated);
            socket.off("comment:replied", handleCommentReplied);
        };
    }, [postId]);

    // 3. Uppdatera eller skicka tillbaka till /home om inlägget ändras eller raderas
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

        return () => {
            socket.off("post:updated", handlePostUpdated);
            socket.off("post:deleted", handlePostDeleted);
        };
    }, [postId, navigate]);

    const handleEditPost = (updatedPost) => {
        setPost(updatedPost);
    };

    const handleDeletePost = () => {
        navigate("/home");
    };

    return (
        <>

            {!isLoading && error && (
                <div className="max-w-lg mx-auto mt-20 px-4 text-center">
                    <p className="text-sm text-zinc-500">
                        This post is no longer available.
                    </p>
                </div>
            )}


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
                    />
                </section>
            )}
        </>
    );
}

export default SinglePostPage;