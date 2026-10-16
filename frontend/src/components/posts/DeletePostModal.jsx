import { useState } from "react";
import api from "../../api/axios";

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
      {/* Outer card wrapper - Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans bg-black/40">
        
        {/* Delete container */}
        <div className="w-full max-w-sm bg-white rounded-lg p-5 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left">
          
          <h3 className="text-sm font-bold text-gray-900 mb-2">Delete Post</h3>
          <p className="text-gray-600 text-xs mb-4">Are you sure you want to delete this post?</p>
          
          {/* Buttons footer */}
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isDeleting} // <--- AVAKTIVERA UNDER RADERING
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-1.5 px-3 rounded-md transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={deletePost}
              disabled={isDeleting} // <--- AVAKTIVERA UNDER RADERING
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-md transition-colors cursor-pointer text-xs shadow-sm disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"} {/* <--- DYNAMISK TEXT */}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100 mt-3">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DeletePostModal;