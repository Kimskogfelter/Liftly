import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiMusic, FiCalendar } from "react-icons/fi";
import { LuDumbbell } from "react-icons/lu";

function PostGridItem({ post }) {
  const hasMedia = post.media && post.media.length > 0;
  const hasCalendar = post.calendarShare; // Kontrollerar om inlägget har en delad kalender
  const hasWorkoutShare = post.workoutShare; // Kontrollerar om inlägget har ett delat träningspass
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  ) || 0;

  const displayCategory = post.subCategory || post.category || "General";

  return (
    <Link
      to={`/posts/${post._id}`}
      className="relative aspect-square min-w-0 rounded-lg overflow-hidden group shadow-sm border border-gray-100 block bg-zinc-900"
    >
      {/* Badges i övre vänstra hörnet */}
      <div className="absolute top-2 left-2 z-20 pointer-events-none flex flex-col gap-1 max-w-[calc(100%-1rem)]">
        {post.recipe && (
          <span className="bg-amber-500/85 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm w-fit truncate max-w-full">
            Recipe
          </span>
        )}
        {post.spotifyUrl && (
          <span className="bg-[#1DB954]/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit max-w-full">
            <FiMusic size={10} className="shrink-0" />
            <span className="truncate">Music</span>
          </span>
        )}
      </div>

      {hasMedia ? (
        <>
          <img
            src={post.media[0]}
            alt="Post thumbnail"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-2 max-w-full">
            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate block">
              {displayCategory}
            </span>
          </div>
        </>
      ) : hasCalendar ? (
        /* Kalender-inlägg med balanserad storlek för både mobil och desktop */
        <div className="w-full h-full min-w-0 overflow-hidden p-2 sm:p-3.5 flex flex-col items-center justify-between text-center relative z-0 bg-zinc-900 border border-zinc-800">
          <div className="flex-1 min-h-0 w-full min-w-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white shadow-inner border border-zinc-700/50 shrink-0">
              <FiCalendar size={15} className="sm:size-4.5" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-white tracking-wide truncate w-full px-1">
              {post.calendarShare.month || "Training Calendar"}
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-wider truncate w-full px-1 shrink-0">
            {displayCategory}
          </span>
        </div>
      ) : hasWorkoutShare ? (
        /* Delat träningspass med samma ikonruta som kalenderdelningen */
        <div className="w-full h-full min-w-0 overflow-hidden p-2 sm:p-3.5 flex flex-col items-center justify-between text-center relative z-0 bg-zinc-900 border border-zinc-800">
          <div className="flex-1 min-h-0 w-full min-w-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-white shadow-inner border border-zinc-700/50 shrink-0">
              <LuDumbbell size={15} className="sm:size-4.5" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-white tracking-wide truncate w-full px-1">
              {post.workoutShare.title || "Workout Session"}
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-wider truncate w-full px-1 shrink-0">
            {displayCategory}
          </span>
        </div>
      ) : (
        /* Textinlägg med line-clamp för att korta av snyggt */
        <div className="w-full h-full min-w-0 overflow-hidden p-2.5 sm:p-4 flex flex-col items-center justify-between text-center relative z-0">
          <div className="flex-1 min-h-0 w-full min-w-0 flex items-center justify-center">
            <p className="text-white text-[10px] sm:text-xs font-medium line-clamp-2 leading-tight sm:leading-relaxed wrap-break-words w-full">
              {post.content}
            </p>
          </div>
          <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-wider pt-1 truncate w-full shrink-0">
            {displayCategory}
          </span>
        </div>
      )}

      {/* Overlay vid hover */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 text-white font-semibold text-xs z-10 backdrop-blur-[2px]">
        <div className="flex items-center gap-1">
          <FiHeart className="fill-white" size={16} />
          <span>{likesCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <FiMessageCircle className="fill-white" size={16} />
          <span>{commentsCount}</span>
        </div>
      </div>
    </Link>
  );
}

export default PostGridItem;