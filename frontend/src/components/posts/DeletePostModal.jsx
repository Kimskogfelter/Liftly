import { useState } from "react";
import api from "../../api/axios";
import { IoClose } from "react-icons/io5";

function DeletePostModal({ post, onClose, currentUser, handleDeletePost }) {

  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePost = async (e) => {
    setIsDeleting(true); // <--- AKTIVERA LOADING
    setError("");

    try {
      // delete post data from backend
      await api.delete(`/posts/${post._id}`);

      // Execute the function from Home/ProfilePage to update the UI instantly
      handleDeletePost(post._id);

      // close the deletePost component after successful post deletion
      onClose();

    } catch (err) {
      // handle errors and display error message to user
      const errorResponse = err.response?.data;
      setError(errorResponse?.message || "Your post could not be deleted. Please try again.");
      setIsDeleting(false); // <--- ÅTERSTÄLL VID FEL
    }
  };

  return (
    <>
      {/* Outer card wrapper - Compact confirmation modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans "
        onClick={onClose}
      >
        
        {/* Delete container */}
        <div
          className="w-full max-w-sm bg-white rounded-lg p-5 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900">Delete Post</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting} // <--- AVAKTIVERA UNDER RADERING
              className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Close"
            >
              <IoClose size={20} />
            </button>
          </div>

          <p className="text-gray-600 text-xs mb-4">Are you sure you want to delete this post?</p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100 mb-3">
              {error}
            </div>
          )}

          {/* Full-width delete button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={deletePost}
              disabled={isDeleting} // <--- AVAKTIVERA UNDER RADERING
              className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"} {/* <--- DYNAMISK TEXT */}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeletePostModal;