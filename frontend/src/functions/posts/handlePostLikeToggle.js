import api from "../../api/axios";

export const handlePostLikeToggle = async (
    isLiked,
    setIsLiked,
    setLikesCount,
    post,
    currentUser,
    isToggling = false,
    setIsToggling = null
) => {
    if (!post?._id || isToggling) return;

    const prevLiked = Boolean(isLiked);
    setIsToggling?.(true);

    // Optimistisk uppdatering
    setIsLiked(!prevLiked);
    setLikesCount((prev) => Math.max(0, prev + (prevLiked ? -1 : 1)));

    try {
        if (prevLiked) {
            const res = await api.delete(`/posts/${post._id}/unlike`);
            if (typeof res.data?.likesCount === "number") {
                setLikesCount(res.data.likesCount);
            }
        } else {
            const res = await api.post(`/posts/${post._id}/like`, {});
            if (typeof res.data?.likesCount === "number") {
                setLikesCount(res.data.likesCount);
            }
        }
    } catch (err) {
        // Återställ vid fel
        setIsLiked(prevLiked);
        setLikesCount((prev) => Math.max(0, prev + (prevLiked ? 1 : -1)));
    } finally {
        setIsToggling?.(false);
    }
};