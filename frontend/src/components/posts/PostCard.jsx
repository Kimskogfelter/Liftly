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

// Kortformaterar tidsenheter till t.ex. "5m", "2h" eller "3d"
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

// Räknar ihop både huvudkommentarer och alla svar i listan
const calcCommentsTotal = (commentsArr) =>
    (commentsArr || []).reduce(
        (total, comment) =>
            total +
            1 +
            (comment && typeof comment === "object" ? comment.replies?.length || 0 : 0),
        0
    );

function PostCard({ post, currentUser, setCurrentUser, handleEditPost, handleDeletePost, getSavedPosts, isDetailView }) {
    // Användar- och inläggs-ID normaliserade till strängar för säkra jämförelser
    const currentUserId = String(currentUser?.id || currentUser?._id || "");
    const isAuthenticated = Boolean(currentUserId);
    const postId = String(post?._id || "");

    // Lokal UI- och interaktionsstate för inlägget
    const [showPostActions, setShowPostActions] = useState(false);
    const [isTogglingLike, setIsTogglingLike] = useState(false);

    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(
        Boolean(currentUserId && post.likes?.map(String).includes(currentUserId))
    );
    const [isSaved, setIsSaved] = useState(
        currentUser?.savedPosts?.map(String).includes(postId) || false
    );
    const [commentsCount, setCommentsCount] = useState(() =>
        calcCommentsTotal(post.comments)
    );

    // Sparar tidsstämpel för senaste lokala like-klick för att undvika snabb överskrivning
    const lastLocalLikeActionRef = useRef(0);

    // Synkar antal likes och om användaren gillar när inlägg eller inloggad användare byts
    useEffect(() => {
        if (!postId) return;
        setLikesCount(post.likes?.length || 0);
        setIsLiked(Boolean(currentUserId && post.likes?.map(String).includes(currentUserId)));
    }, [postId, currentUserId]);

    // Uppdaterar likes från post-props om inget lokalt like-klick skett precis nyss (< 1.5s)
    useEffect(() => {
        if (!postId || !Array.isArray(post.likes)) return;
        const msSinceLocalClick = Date.now() - lastLocalLikeActionRef.current;
        if (msSinceLocalClick < 1500) return;

        setLikesCount(post.likes.length);
        setIsLiked(Boolean(currentUserId && post.likes.map(String).includes(currentUserId)));
    }, [post.likes, postId, currentUserId]);

    // Uppdaterar totalt antal kommentarer (inkl. svar) när post.comments ändras
    useEffect(() => {
        if (!postId || !Array.isArray(post.comments)) return;
        setCommentsCount(calcCommentsTotal(post.comments));
    }, [post.comments, postId]);

    // Synkar sparad-markering när användarens sparade inlägg uppdateras
    useEffect(() => {
        setIsSaved(currentUser?.savedPosts?.map(String).includes(postId) || false);
    }, [currentUser?.savedPosts, postId]);

    // Lyssnar på realtidsuppdateringar (likes och kommentarer/svar) via Socket.IO för detta inlägg
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

        const handleCommentDeleted = (payload) => {
            if (String(payload?.postId) !== postId) return;
            const step = typeof payload?.removedCount === "number" ? payload.removedCount : 1;
            setCommentsCount((prev) => Math.max(0, prev - step));
        };

        const handleCommentReplyDeleted = (payload) => {
            if (String(payload?.postId) !== postId) return;
            setCommentsCount((prev) => Math.max(0, prev - 1));
        };

        socket.on("post:liked", handleLiked);
        socket.on("post:unliked", handleUnliked);
        socket.on("comment:created", handleCommentCreated);
        socket.on("comment:replied", handleCommentReplied);
        socket.on("comment:deleted", handleCommentDeleted);
        socket.on("comment:replyDeleted", handleCommentReplyDeleted);

        // Lämnar inläggets rum och städar bort lyssnare vid unmount eller byte av inlägg
        return () => {
            socket.emit("leavePost", postId);
            socket.off("post:liked", handleLiked);
            socket.off("post:unliked", handleUnliked);
            socket.off("comment:created", handleCommentCreated);
            socket.off("comment:replied", handleCommentReplied);
            socket.off("comment:deleted", handleCommentDeleted);
            socket.off("comment:replyDeleted", handleCommentReplyDeleted);
        };
    }, [postId, currentUserId]);

    // Media- och modalstate för bilder, video och Spotify-embed
    const [fullsizeImage, setFullsizeImage] = useState(null);
    const spotifyEmbedUrl = post.spotifyUrl ? createSpotifyEmbedUrl(post.spotifyUrl) : null;
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const hasMedia = post.media && post.media.length > 0;
    const currentMediaUrl = hasMedia ? post.media[currentMediaIndex] : "";
    const isVideo = currentMediaUrl.match(/\.(mp4|mov|webm|mkv|avi)$/i) || currentMediaUrl.includes("/video/upload/");

    const navigate = useNavigate();

    // Öppnar inläggets detaljvy
    const handleCardClick = () => {
        navigate(`/posts/${post._id}`);
    };

    // Bläddrar framåt/bakåt bland inläggets bilder
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

    // Skickar utloggade användare till /login innan åtgärden körs
    const requireAuth = (action) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        action();
    };

    // Hanterar gilla-klick (kräver inloggning)
    const onLikeClick = () => {
        requireAuth(() => {
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
        });
    };

    // Hanterar spara-klick (kräver inloggning)
    const onSaveClick = () => {
        requireAuth(() => {
            handleSavePost(
                isSaved,
                setIsSaved,
                post,
                currentUser,
                setCurrentUser,
                getSavedPosts
            );
        });
    };

    const displayCategory = post.subCategory || post.category || "General";

    return (
        <>
            <section className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-4 font-sans text-gray-800 my-3 relative h-auto flex flex-col justify-between">
                <div>
                    {/* Topprad med användare, kategori och ev. redigera/ta bort/rapportera-meny */}
                    <PostHeader
                        post={post}
                        currentUser={currentUser}
                        displayCategory={displayCategory}
                        showPostActions={showPostActions}
                        setShowPostActions={setShowPostActions}
                        handleEditPost={handleEditPost}
                        handleDeletePost={handleDeletePost}
                        customTimeFormatter={customTimeFormatter}
                        requireAuth={requireAuth}
                    />

                    {/* Klickbar inläggsyta som leder till detaljvyn i flödet */}
                    <div
                        onClick={!isDetailView ? handleCardClick : undefined}
                        className={`block group text-left ${!isDetailView ? "cursor-pointer transition-opacity hover:opacity-95" : ""}`}
                    >
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

                        {/* Inläggstext och klickbara hashtags */}
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

                        {/* Valfria delade block: recept, kalender och träningspass */}
                        <PostRecipe recipe={post.recipe} isDetailView={isDetailView} />

                        <PostCalendarShare calendarShare={post.calendarShare} />

                        <PostWorkoutShare workoutShare={post.workoutShare} />
                    </div>

                    {/* Valfri Spotify-spelare */}
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

                {/* Bottenrad med gilla, kommentarer och spara */}
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
                    handleSavePost={onSaveClick}
                    getSavedPosts={getSavedPosts}
                />

                {/* Fullskärmsvisning för vald bild */}
                {fullsizeImage && (
                    <FullsizeImageModal imageUrl={fullsizeImage} onClose={() => setFullsizeImage(null)} />
                )}
            </section>
        </>
    );
}

export default PostCard;