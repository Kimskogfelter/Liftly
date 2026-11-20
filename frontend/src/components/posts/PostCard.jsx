import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSocket } from "../../api/socket";
import { handlePostLikeToggle } from "../../functions/posts/handlePostLikeToggle";
import { handleSavePost } from "../../functions/posts/handleSavePost";
import { createSpotifyEmbedUrl } from "../../functions/spotify/spotify";
import FullsizeImageModal from "./FullsizeImageModal";
import PostCalendarShare from "./PostCalendarShare";
import PostWorkoutShare from "./PostWorkoutShare";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";
import PostRecipe from "./PostRecipe";
import PostFooter from "./PostFooter";

const customTimeFormatter = (value, unit) => {
    const unitMap = {
        second: "s",
        minute: "m",
        hour: "h",
        day: "d",
        week: "w",
        month: "mo",
        year: "y",
    };
    return `${value}${unitMap[unit] || unit.charAt(0)}`;
};

function PostCard({ post, currentUser, setCurrentUser, handleEditPost, handleDeletePost, getSavedPosts, isDetailView }) {
    const currentUserId = String(currentUser?.id || currentUser?._id || "");
    const postId = String(post?._id || "");

    const [showPostActions, setShowPostActions] = useState(false);
    const [isTogglingLike, setIsTogglingLike] = useState(false);

    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(
        Boolean(currentUserId && post.likes?.map(String).includes(currentUserId))
    );
    const [isSaved, setIsSaved] = useState(
        currentUser?.savedPosts?.map(String).includes(postId) || false
    );

    const [commentsCount, setCommentsCount] = useState(
        post.comments?.reduce(
            (total, comment) => total + 1 + (comment.replies?.length || 0),
            0
        ) || 0
    );

    // Håll koll på om vi nyligen gjort en lokal like/unlike så vi inte skriver över med gammal prop
    const lastLocalLikeActionRef = useRef(0);

    // Synka initialt när postId eller currentUserId ändras
    useEffect(() => {
        if (!postId) return;
        setLikesCount(post.likes?.length || 0);
        setIsLiked(Boolean(currentUserId && post.likes?.map(String).includes(currentUserId)));
    }, [postId, currentUserId]);

    // Synka om post.likes uppdateras utifrån (t.ex. post:updated) och det inte var ett lokalt klick precis nyss
    useEffect(() => {
        if (!postId || !Array.isArray(post.likes)) return;
        const msSinceLocalClick = Date.now() - lastLocalLikeActionRef.current;
        if (msSinceLocalClick < 1500) return;

        setLikesCount(post.likes.length);
        setIsLiked(Boolean(currentUserId && post.likes.map(String).includes(currentUserId)));
    }, [post.likes, postId, currentUserId]);

    // Synka sparat-status när currentUser ändras
    useEffect(() => {
        setIsSaved(currentUser?.savedPosts?.map(String).includes(postId) || false);
    }, [currentUser?.savedPosts, postId]);

    // Prenumerera på post:${post._id} via Socket.io
    useEffect(() => {
        if (!postId) return;
        const socket = getSocket();

        socket.emit("joinPost", postId);

        const handleLiked = (payload) => {
            if (String(payload?.postId) !== postId) return;

            if (typeof payload.likesCount === "number") {
                setLikesCount(payload.likesCount);
            }
            if (currentUserId && String(payload.userId) === currentUserId) {
                setIsLiked(true);
            }
        };

        const handleUnliked = (payload) => {
            if (String(payload?.postId) !== postId) return;

            if (typeof payload.likesCount === "number") {
                setLikesCount(payload.likesCount);
            }
            if (currentUserId && String(payload.userId) === currentUserId) {
                setIsLiked(false);
            }
        };

        const handleCommentCreated = (payload) => {
            if (String(payload?.postId) !== postId) return;
            setCommentsCount((prev) => prev + 1);
        };

        const handleCommentReplied = (payload) => {
            if (String(payload?.postId) !== postId) return;
            setCommentsCount((prev) => prev + 1);
        };

        socket.on("post:liked", handleLiked);
        socket.on("post:unliked", handleUnliked);
        socket.on("comment:created", handleCommentCreated);
        socket.on("comment:replied", handleCommentReplied);

        return () => {
            socket.emit("leavePost", postId);
            socket.off("post:liked", handleLiked);
            socket.off("post:unliked", handleUnliked);
            socket.off("comment:created", handleCommentCreated);
            socket.off("comment:replied", handleCommentReplied);
        };
    }, [postId, currentUserId]);

    const [fullsizeImage, setFullsizeImage] = useState(null);

    const spotifyEmbedUrl = post.spotifyUrl ? createSpotifyEmbedUrl(post.spotifyUrl) : null;
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const hasMedia = post.media && post.media.length > 0;
    const currentMediaUrl = hasMedia ? post.media[currentMediaIndex] : "";
    const isVideo = currentMediaUrl.match(/\.(mp4|mov|webm|mkv|avi)$/i) || currentMediaUrl.includes("/video/upload/");

    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/posts/${post._id}`);
    };

    const handleNextMedia = (e) => {
        e.preventDefault();
        if (post.media && currentMediaIndex < post.media.length - 1) {
            setCurrentMediaIndex(currentMediaIndex + 1);
        }
    };

    const handlePrevMedia = (e) => {
        e.preventDefault();
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(currentMediaIndex - 1);
        }
    };

    const onLikeClick = () => {
        lastLocalLikeActionRef.current = Date.now();
        handlePostLikeToggle(
            isLiked,
            setIsLiked,
            setLikesCount,
            post,
            currentUser,
            isTogglingLike,
            setIsTogglingLike
        );
    };

    const displayCategory = post.subCategory || post.category || "General";

    return (
        <>
            <section className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-4 font-sans text-gray-800 my-3 relative h-auto flex flex-col justify-between">
                <div>
                    {/* HEADER: Användare, Tid, Kategori och Meny */}
                    <PostHeader
                        post={post}
                        currentUser={currentUser}
                        displayCategory={displayCategory}
                        showPostActions={showPostActions}
                        setShowPostActions={setShowPostActions}
                        handleEditPost={handleEditPost}
                        handleDeletePost={handleDeletePost}
                        customTimeFormatter={customTimeFormatter}
                    />

                    {/* POST INNEHÅLL */}
                    <div
                        onClick={!isDetailView ? handleCardClick : undefined}
                        className={`block group text-left ${!isDetailView ? "cursor-pointer transition-opacity hover:opacity-95" : ""}`}
                    >
                        {/* MEDIA HÖGST UPP */}
                        <PostMedia
                            hasMedia={hasMedia}
                            isVideo={isVideo}
                            currentMediaUrl={currentMediaUrl}
                            currentMediaIndex={currentMediaIndex}
                            post={post}
                            isDetailView={isDetailView}
                            handlePrevMedia={handlePrevMedia}
                            handleNextMedia={handleNextMedia}
                            setFullsizeImage={setFullsizeImage}
                        />

                        {/* TEXT & HASHTAGS */}
                        <div className="mb-2 px-0.5 space-y-1">
                            <p className={`${isDetailView ? "" : "line-clamp-2 overflow-hidden"} text-xs text-gray-800 font-normal leading-relaxed whitespace-pre-wrap`}>
                                {post.content}
                            </p>

                            {post.hashtags && post.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {post.hashtags.map((hashtag, index) => {
                                        const cleanTag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
                                        const displayTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;

                                        return (
                                            <Link
                                                key={index}
                                                to={`/hashtag/${cleanTag}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs font-semibold text-gray-500 hover:text-black hover:underline cursor-pointer"
                                            >
                                                {displayTag}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* RECEPT-KORT */}
                        <PostRecipe recipe={post.recipe} isDetailView={isDetailView} />

                        {/* KALENDER-KORT (DELAD MÅNAD) - LJUS STIL */}
                        <PostCalendarShare calendarShare={post.calendarShare} />

                        {/* TRÄNINGSPASS-KORT (DELAT PASS) */}
                        <PostWorkoutShare workoutShare={post.workoutShare} />
                    </div>

                    {/* SPOTIFY EMBED */}
                    {spotifyEmbedUrl && (
                        <div className="mt-2 mb-2 overflow-hidden rounded-lg border border-gray-100 shadow-2xs">
                            <iframe
                                src={spotifyEmbedUrl}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allow="encrypted-media"
                                className="w-full block"
                            />
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <PostFooter
                    post={post}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    isLiked={isLiked}
                    setIsLiked={setIsLiked}
                    likesCount={likesCount}
                    setLikesCount={setLikesCount}
                    isSaved={isSaved}
                    setIsSaved={setIsSaved}
                    commentsCount={commentsCount}
                    handlePostLikeToggle={onLikeClick}
                    handleSavePost={handleSavePost}
                    getSavedPosts={getSavedPosts}
                />

                {fullsizeImage && (
                    <FullsizeImageModal imageUrl={fullsizeImage} onClose={() => setFullsizeImage(null)} />
                )}
            </section>
        </>
    );
}

export default PostCard;