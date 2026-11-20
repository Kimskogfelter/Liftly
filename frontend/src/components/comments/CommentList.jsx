import React, { useState, useEffect, useRef } from "react";
import CommentCard from "./CommentCard";

const INITIAL_COUNT = 3;
const LOAD_STEP = 10;

const countCommentWithReplies = (comment) =>
    1 + (comment?.replies?.length || 0);

function CommentList({
    comments,
    currentUser,
    focusedCommentId = "",
    focusedReplyId = "",
    onCommentDeleted,
    onReplyDeleted,
}) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
    const [highlightedId, setHighlightedId] = useState("");
    const scrolledTargetRef = useRef("");

    const targetId = focusedReplyId || focusedCommentId;

    useEffect(() => {
        if (!targetId || comments.length === 0) return;

        const targetIndex = comments.findIndex((c) => {
            const matchesComment =
                focusedCommentId && String(c._id) === String(focusedCommentId);
            const matchesReply =
                focusedReplyId &&
                c.replies?.some((r) => String(r._id) === String(focusedReplyId));
            return matchesComment || matchesReply;
        });

        if (targetIndex !== -1 && targetIndex + 1 > visibleCount) {
            setVisibleCount(targetIndex + 1);
        }
    }, [targetId, comments, focusedCommentId, focusedReplyId, visibleCount]);

    useEffect(() => {
        if (!targetId || comments.length === 0) return;
        if (scrolledTargetRef.current === targetId) return;

        const elementId = focusedReplyId
            ? `reply-${focusedReplyId}`
            : `comment-${focusedCommentId}`;

        let attempts = 0;
        let highlightTimeoutId = null;

        const intervalId = setInterval(() => {
            attempts += 1;
            const el = document.getElementById(elementId);

            if (el) {
                clearInterval(intervalId);
                scrolledTargetRef.current = targetId;

                requestAnimationFrame(() => {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    setHighlightedId(targetId);
                });

                highlightTimeoutId = setTimeout(() => {
                    setHighlightedId("");
                }, 2500);
            } else if (attempts >= 25) {
                clearInterval(intervalId);
            }
        }, 100);

        return () => {
            clearInterval(intervalId);
            if (highlightTimeoutId) clearTimeout(highlightTimeoutId);
        };
    }, [comments, visibleCount, targetId, focusedCommentId, focusedReplyId]);

    const visibleComments = comments.slice(0, visibleCount);

    const totalAllCount = comments.reduce(
        (sum, c) => sum + countCommentWithReplies(c),
        0
    );
    const visibleAllCount = visibleComments.reduce(
        (sum, c) => sum + countCommentWithReplies(c),
        0
    );
    const remainingAllCount = Math.max(0, totalAllCount - visibleAllCount);

    return (
        <div className="mt-4 space-y-3">
            {visibleComments.map((comment) => (
                <CommentCard
                    key={comment._id}
                    comment={comment}
                    currentUser={currentUser}
                    focusedCommentId={focusedCommentId}
                    focusedReplyId={focusedReplyId}
                    highlightedId={highlightedId}
                    onCommentDeleted={onCommentDeleted}
                    onReplyDeleted={onReplyDeleted}
                />
            ))}

            {remainingAllCount > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setVisibleCount((prev) => prev + LOAD_STEP)}
                        className="text-xs font-semibold text-zinc-500 hover:text-black pt-1 cursor-pointer"
                    >
                        Show more ({remainingAllCount} left)
                    </button>
                </div>
            )}
        </div>
    );
}

export default CommentList;