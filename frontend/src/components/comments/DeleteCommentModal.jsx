import { useState } from "react";
import { IoClose } from "react-icons/io5";
import api from "../../api/axios";

function DeleteCommentModal({
  targetType = "comment", // "comment" | "reply"
  commentId,
  replyId = null,
  onClose,
  onDeleted,
}) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isReply = targetType === "reply" && Boolean(replyId);
  const title = isReply ? "Delete Reply" : "Delete Comment";
  const confirmText = isReply
    ? "Are you sure you want to delete this reply?"
    : "Are you sure you want to delete this comment?";

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const endpoint = isReply
        ? `/posts/comments/${commentId}/replies/${replyId}`
        : `/posts/comments/${commentId}`;

      await api.delete(endpoint);

      if (onDeleted) {
        onDeleted(isReply ? replyId : commentId);
      }

      onClose();
    } catch (err) {
      const errorResponse = err.response?.data;
      setError(
        errorResponse?.message ||
          (isReply
            ? "Your reply could not be deleted. Please try again."
            : "Your comment could not be deleted. Please try again.")
      );
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans bg-black/20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-lg p-5 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <IoClose size={20} />
          </button>
        </div>

        <p className="text-gray-600 text-xs mb-4">{confirmText}</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100 mb-3">
            {error}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCommentModal;