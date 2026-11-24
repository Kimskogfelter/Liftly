import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Formulär för att skapa en ny huvudkommentar på ett inlägg
function CreateCommentForm({ currentUser, setComments, postId }) {
  const navigate = useNavigate();

  // Avgör om användaren är inloggad via normaliserat användar-ID
  const currentUserId = String(currentUser?.id || currentUser?._id || "");
  const isAuthenticated = Boolean(currentUserId);

  // Lokal state för kommentarstext, felmeddelande och skickningsstatus
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skickar utloggade användare till /login innan kontokrävande åtgärder körs
  const requireAuth = (action) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
  };

  // Validerar och skickar den nya kommentaren till backend (kräver inloggning)
  const createComment = async (e) => {
    e.preventDefault();

    requireAuth(async () => {
      if (!content.trim() || isSubmitting) return;

      setIsSubmitting(true);
      setError("");

      try {
        const response = await api.post(`/posts/${postId}/comments/create`, {
          content,
          postId,
        });
        const newComment = response.data.newComment;

        // Lägger till kommentaren högst upp utan dubbletter om den redan kommit via socket
        if (newComment) {
          setComments((prev) =>
            prev.some((c) => String(c._id) === String(newComment._id))
              ? prev
              : [newComment, ...prev]
          );
        }
        setContent("");
      } catch (err) {
        const errorResponse = err.response?.data;
        setError(
          errorResponse?.message ||
            "Your comment could not be created. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <>
      <form
        action="POST"
        method="post"
        onSubmit={createComment}
        className="w-full max-w-lg mx-auto bg-white border rounded-lg border-gray-100 p-2 flex items-center gap-2 shadow-sm font-sans my-3 relative"
      >
        {/* Textfält för kommentar */}
        <input
          type="text"
          name="content"
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          className="flex-1 bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none px-2 py-1 disabled:opacity-50"
        />

        {/* Skicka-knapp (om utloggad och text saknas, låt användaren kunna klicka till /login) */}
        <button
          type="submit"
          className="text-xs font-bold text-gray-800 hover:text-gray-800 disabled:text-gray-300 transition-colors cursor-pointer px-2 py-1 shrink-0"
          disabled={isSubmitting || (isAuthenticated && !content.trim())}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>

        {/* Felmeddelande vid misslyckat anrop */}
        {error && (
          <p className="absolute left-2 -bottom-5 text-[10px] text-red-500 font-medium">
            {error}
          </p>
        )}
      </form>
    </>
  );
}

export default CreateCommentForm;