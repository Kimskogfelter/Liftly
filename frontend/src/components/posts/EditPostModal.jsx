import React, { useState } from "react";
import api from "../../api/axios";
import { FiPlus } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

function EditPostModal({ onClose, onSaved, handleEditPost, post, currentUser }) {

  const postId = post._id;
  const [content, setContent] = useState(post.content || "");

  // Recept-states (använder ?? "" så 0 bevaras i fälten)
  const [recipeTitle, setRecipeTitle] = useState(post.recipe?.title ?? "");
  const [prepTime, setPrepTime] = useState(post.recipe?.prepTimeMinutes ?? "");
  const [calories, setCalories] = useState(post.recipe?.nutrition?.calories ?? "");
  const [protein, setProtein] = useState(post.recipe?.nutrition?.protein ?? "");

  // Normalisera ingredienser till objekt med name
  const [ingredients, setIngredients] = useState(() =>
    (post.recipe?.ingredients || []).map((ing) =>
      typeof ing === "string"
        ? { name: ing }
        : { name: ing?.name || "" }
    )
  );

  // Normalisera instruktioner till strängar
  const [instructions, setInstructions] = useState(() =>
    (post.recipe?.instructions || []).map((step) =>
      typeof step === "string" ? step : step?.text || step?.instruction || ""
    )
  );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hantera ingredienser
  const handleIngredientChange = (index, value) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { name: value } : item))
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "" }]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Hantera instruktioner
  const handleInstructionChange = (index, value) => {
    setInstructions((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  const addInstruction = () => {
    setInstructions((prev) => [...prev, ""]);
  };

  const removeInstruction = (index) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // Spara ändringar
  const editPost = async (e) => {
    e.preventDefault();
    setError("");

    const updatedData = {
      content,
    };

    if (post.recipe) {
      if (!recipeTitle || !recipeTitle.trim()) {
        setError("Please enter a recipe title");
        return;
      }
      if (prepTime === "" || prepTime === undefined) {
        setError("Please enter preparation time");
        return;
      }
      if (calories === "" || calories === undefined) {
        setError("Please enter calories");
        return;
      }
      if (protein === "" || protein === undefined) {
        setError("Please enter protein");
        return;
      }

      const formattedIngredients = ingredients
        .map((ing) => {
          const nameVal = typeof ing === "string" ? ing : ing?.name;
          if (!nameVal || nameVal.trim() === "") return null;
          return { name: nameVal.trim() };
        })
        .filter(Boolean);

      if (formattedIngredients.length === 0) {
        setError("Please fill in all ingredients");
        return;
      }

      const formattedInstructions = instructions
        .map((ins) => (typeof ins === "string" ? ins : ins?.text || ins?.instruction || ""))
        .filter((ins) => ins && ins.trim() !== "");

      if (formattedInstructions.length === 0) {
        setError("Please fill in all instruction steps");
        return;
      }

      updatedData.recipe = {
        ...post.recipe,
        title: recipeTitle.trim(),
        prepTimeMinutes: Number(prepTime) || 0,
        nutrition: {
          ...post.recipe.nutrition,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
        },
        ingredients: formattedIngredients,
        instructions: formattedInstructions
      };
    }

    setIsSubmitting(true);

    try {
      const response = await api.patch(`/posts/${postId}/update`, updatedData);
      const updatedPost = response.data.updatedPost;
      if (handleEditPost && updatedPost) {
        handleEditPost(updatedPost);
      }

      if (onSaved) {
        onSaved();
      } else {
        onClose();
      }

    } catch (err) {
      const errorResponse = err.response?.data;
      setError(errorResponse?.message || "Your post could not be updated. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Outer card wrapper - Fullscreen on mobile, modal on desktop */}
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 font-sans bg-black/40 backdrop-blur-sm overflow-y-auto">

        {/* Edit container */}
        <div className="w-full min-h-screen sm:min-h-0 sm:max-w-lg bg-white rounded-none sm:rounded-lg p-5 pt-6 sm:p-6 shadow-none sm:shadow-2xl border-0 sm:border border-gray-100 text-left sm:max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Edit Post</h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Close"
            >
              <IoClose size={20} />
            </button>
          </div>

          <form onSubmit={editPost} className="space-y-4">

            {/* Caption */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Caption</label>
              <textarea
                name="content"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-36 sm:min-h-24 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-black bg-gray-50/30 transition-colors"
              ></textarea>
            </div>

            {/* OM POSTEN HAR ETT RECEPT */}
            {post.recipe && (
              <div className="space-y-4 pt-3 border-t border-gray-100">

                {/* Recept Titel */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Recipe Title *</label>
                  <input
                    type="text"
                    value={recipeTitle}
                    onChange={(e) => setRecipeTitle(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Tid & Makros */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Time (min) *</label>
                    <input
                      type="number"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Calories *</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Protein (g) *</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* INGREDIENTS SEKTION */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-700">Ingredients *</label>

                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="bg-zinc-50 border border-zinc-200/70 rounded-lg p-2.5 flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={typeof ing === "string" ? ing : (ing?.name || "")}
                        onChange={(e) => handleIngredientChange(idx, e.target.value)}
                        placeholder="e.g. 500g chicken breast"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-black transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                        title="Remove ingredient"
                      >
                        <FaRegTrashAlt size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addIngredient}
                    className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                  >
                    <FiPlus size={14} /> Add Ingredient
                  </button>
                </div>

                {/* INSTRUCTIONS SEKTION */}
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-gray-700">Instructions *</label>

                  {instructions.map((step, idx) => (
                    <div key={idx} className="bg-zinc-50 border border-zinc-200/70 rounded-lg p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xs font-bold text-zinc-400 shrink-0">{idx + 1}.</span>
                        <input
                          type="text"
                          value={typeof step === "string" ? step : ""}
                          onChange={(e) => handleInstructionChange(idx, e.target.value)}
                          placeholder="Describe step..."
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInstruction(idx)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                        title="Remove step"
                      >
                        <FaRegTrashAlt size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addInstruction}
                    className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                  >
                    <FiPlus size={14} /> Add Step
                  </button>
                </div>

              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100 text-left">
                {error}
              </div>
            )}

            {/* Footer Row: Full-width submit button */}
            <div className="pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditPostModal;