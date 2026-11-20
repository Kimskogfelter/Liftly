import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { FiImage, FiChevronDown } from "react-icons/fi";
import { IoClose, IoCloseCircle } from "react-icons/io5";
import { BsSpotify } from "react-icons/bs";
import { TagsInput } from "react-tag-input-component";
import RecipeForm from "./RecipeForm";
import MediaCropPicker from "./MediaCropPicker";
import { Capacitor } from "@capacitor/core";
import { Camera } from "@capacitor/camera";

const DEFAULT_CROP = { x: 50, y: 20, zoom: 1 };

function CreatePostModal({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // -----------------------------------------------------------------
  // 1. STATES: Grundläggande inläggsfält
  // -----------------------------------------------------------------
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [mediaCrops, setMediaCrops] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [hashtags, setHashtags] = useState([]);
  const [spotifyUrl, setSpotifyUrl] = useState(null);
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);

  // -----------------------------------------------------------------
  // 2. STATES: Kategorier & UI-kontroller
  // -----------------------------------------------------------------
  const [category, setCategory] = useState("General");
  const [subCategory, setSubCategory] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------------------------------
  // 3. STATES: Recept-formulär & Sparad data
  // -----------------------------------------------------------------
  const [showRecipeView, setShowRecipeView] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);

  const [savedRecipeData, setSavedRecipeData] = useState(null);

  // Skapa stabila preview-URL:er för valda filer och städa upp gamla
  const mediaPreviews = useMemo(
    () => media.map((file) => URL.createObjectURL(file)),
    [media]
  );

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaPreviews]);

  // Hantera bildval via Capacitor på mobil
  const handleNativeMediaPick = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: "uri",
          source: "PROMPT",
        });

        if (image.webPath) {
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          const file = new File([blob], "post-camera.jpg", { type: blob.type });
          setMedia((prev) => {
            const next = [...prev, file];
            setActiveMediaIndex(next.length - 1);
            return next;
          });
          setMediaCrops((prev) => [...prev, { ...DEFAULT_CROP }]);
          setError("");
        }
      } catch (err) {
        console.log("User cancelled or error occurred:", err);
      }
    }
  };

  // Stäng dropdown-menyn om användaren klickar utanför
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setExpandedCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeMediaFile = (indexToRemove) => {
    setMedia((prev) => {
      const next = prev.filter((_, index) => index !== indexToRemove);
      setActiveMediaIndex((currentIdx) =>
        next.length === 0 ? 0 : Math.min(currentIdx, next.length - 1)
      );
      return next;
    });
    setMediaCrops((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const getDisplayCategoryText = () => {
    if (subCategory && subCategory !== category) {
      return `Category: ${category} → ${subCategory}`;
    }
    return `Category: ${category}`;
  };

  const handleSaveRecipe = () => {
    const recipeData = {
      title: recipeTitle,
      prepTimeMinutes: Number(prepTimeMinutes) || 0,
      nutrition: {
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
      },
      ingredients: ingredients
        .filter((item) => item.trim() !== "")
        .map((item) => ({
          name: item.trim(),
          amount: 1,
          unit: "",
        })),
      instructions: instructions.filter((step) => step.trim() !== ""),
    };

    setSavedRecipeData(recipeData);
    setShowRecipeView(false);
  };

  const handleBackWithoutSaving = () => {
    setShowRecipeView(false);
  };

  const handleClearAndClose = () => {
    setRecipeTitle("");
    setPrepTimeMinutes("");
    setCalories("");
    setProtein("");
    setIngredients([""]);
    setInstructions([""]);
    setSavedRecipeData(null);
    setShowRecipeView(false);
  };

  const createPost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("spotifyUrl", spotifyUrl || "");
      formData.append("hashtags", JSON.stringify(hashtags));

      if (savedRecipeData) {
        formData.append("recipe", JSON.stringify(savedRecipeData));
      }

      if (media.length > 0) {
        media.forEach((file) => {
          formData.append("media", file);
        });

        const syncedCrops = media.map((_, idx) => ({
          ...DEFAULT_CROP,
          ...(mediaCrops[idx] || {}),
        }));
        formData.append("mediaCrops", JSON.stringify(syncedCrops));
      }

      const response = await api.post(`/posts/create`, formData);

      if (response.status === 201) {
        window.dispatchEvent(new Event("postCreated"));
        onClose();

        if (location.pathname !== "/") {
          navigate("/");
        }
      }
    } catch (err) {
      const errorResponse = err.response?.data;
      setError(
        errorResponse?.message ||
          "Your post could not be created. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 font-sans overflow-y-auto">
      <div className="w-full min-h-screen sm:min-h-0 sm:max-w-md sm:max-h-[90vh] bg-white rounded-none sm:rounded-lg p-5 pt-6 sm:pt-5 shadow-none sm:shadow-2xl border-0 sm:border border-gray-100 text-left overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            {showRecipeView ? "Add Recipe" : "Create Post"}
          </h3>
          <button
            type="button"
            onClick={showRecipeView ? handleBackWithoutSaving : onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            title={showRecipeView ? "Back to post" : "Close"}
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={createPost} className="space-y-3">
          {showRecipeView ? (
            <RecipeForm
              recipeTitle={recipeTitle}
              setRecipeTitle={setRecipeTitle}
              prepTimeMinutes={prepTimeMinutes}
              setPrepTimeMinutes={setPrepTimeMinutes}
              calories={calories}
              setCalories={setCalories}
              protein={protein}
              setProtein={setProtein}
              ingredients={ingredients}
              setIngredients={setIngredients}
              instructions={instructions}
              setInstructions={setInstructions}
              onSave={handleSaveRecipe}
              onCancel={handleBackWithoutSaving}
              onClear={handleClearAndClose}
            />
          ) : (
            <>
              <div className="relative">
                <textarea
                  name="content"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-44 sm:min-h-27.5 text-xs text-gray-800 placeholder-gray-400 border border-zinc-200 rounded-lg p-3 resize-none focus:outline-none focus:border-zinc-400 bg-gray-50/30 transition-colors"
                ></textarea>
              </div>

              {media.length > 0 && (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-2 pt-1 px-0.5">
                    {media.map((file, index) => {
                      const isVideoFile = file.type.startsWith("video/");
                      const fileUrl = mediaPreviews[index];
                      const isSelected = index === activeMediaIndex;

                      return (
                        <div
                          key={index}
                          onClick={() => setActiveMediaIndex(index)}
                          className={`relative shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-black border border-black"
                              : "border border-gray-100 opacity-80 hover:opacity-100"
                          }`}
                        >
                          {isVideoFile ? (
                            <video
                              src={fileUrl}
                              className="w-full h-full object-cover"
                              controls={false}
                              muted
                            />
                          ) : (
                            <img
                              src={fileUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMediaFile(index);
                            }}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black transition-colors cursor-pointer"
                          >
                            <IoCloseCircle size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <MediaCropPicker
                    previews={mediaPreviews}
                    crops={mediaCrops}
                    activeIndex={activeMediaIndex}
                    onChange={setMediaCrops}
                  />
                </>
              )}

              <div className="space-y-1">
                <div className="text-xs [&_.rti\--container]:border-zinc-200! [&_.rti\--container]:bg-gray-50/30 [&_.rti\--container]:rounded-lg [&_.rti\--container]:p-2.5 [&_.rti\--container]:transition-colors [&_.rti\--container]:focus-within:border-zinc-400! [&_.rti\--tag]:bg-zinc-200/60 [&_.rti\--tag]:text-zinc-800 [&_.rti\--tag]:text-[11px] [&_.rti\--tag]:font-medium [&_.rti\--tag]:py-0.5 [&_.rti\--tag]:px-2 [&_.rti\--tag]:rounded-md [&_.rti\--input]:bg-transparent [&_.rti\--input]:text-xs [&_.rti\--input]:text-gray-800 [&_.rti\--input]:placeholder-gray-400 [&_.rti\--input]:p-0 [&_.rti\--input]:m-0">
                  <TagsInput
                    value={hashtags}
                    onChange={(newTags) => {
                      const formatted = newTags
                        .map((tag) => {
                          const cleanTag = tag.trim().replace(/^#+/, "");
                          return cleanTag ? `#${cleanTag.toLowerCase()}` : "";
                        })
                        .filter(Boolean);
                      const uniqueTags = [...new Set(formatted)];
                      setHashtags(uniqueTags);
                    }}
                    name="hashtags"
                    placeHolder="Add hashtags"
                    separators={[" "]}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 px-1">
                  Press Space to add hashtag
                </p>
              </div>

              {showSpotifyInput && (
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <BsSpotify
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Paste Spotify track, playlist or album URL..."
                      value={spotifyUrl || ""}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-gray-50/30 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSpotifyUrl(null);
                      setShowSpotifyInput(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <IoCloseCircle size={18} />
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 w-full">
                  <label
                    htmlFor={Capacitor.isNativePlatform() ? undefined : "media"}
                    onClick={(e) => {
                      if (Capacitor.isNativePlatform()) {
                        e.preventDefault();
                        handleNativeMediaPick();
                      }
                    }}
                    className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold px-3 rounded-lg cursor-pointer transition-colors"
                  >
                    <FiImage size={15} className="text-zinc-800 shrink-0" />
                    <span>Media</span>
                    <input
                      className="hidden"
                      type="file"
                      name="media"
                      id="media"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          const chosenFiles = Array.from(e.target.files);
                          setMedia((prev) => {
                            const next = [...prev, ...chosenFiles];
                            setActiveMediaIndex(prev.length);
                            return next;
                          });
                          setMediaCrops((prev) => [
                            ...prev,
                            ...chosenFiles.map(() => ({ ...DEFAULT_CROP })),
                          ]);
                          setError("");
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowSpotifyInput((prev) => !prev)}
                    className={`flex-1 h-10 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 rounded-lg transition-colors cursor-pointer ${
                      spotifyUrl || showSpotifyInput
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    <BsSpotify
                      size={15}
                      className={
                        spotifyUrl || showSpotifyInput
                          ? "text-emerald-500"
                          : "text-zinc-800 shrink-0"
                      }
                    />
                    <span>Spotify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRecipeView(true)}
                    className={`flex-1 h-10 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 rounded-lg transition-colors cursor-pointer text-center ${
                      savedRecipeData
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {savedRecipeData ? (
                      <span className="leading-tight">Recipe added</span>
                    ) : (
                      <span>Add Recipe</span>
                    )}
                  </button>
                </div>

                <div className="relative w-full" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="w-full h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold px-3 pr-7 rounded-lg flex items-center justify-between cursor-pointer outline-none transition-colors relative"
                  >
                    <span className="truncate">{getDisplayCategoryText()}</span>
                    <FiChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 shrink-0"
                      size={12}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-xl shadow-xl border border-zinc-100 py-1.5 z-50 text-xs font-medium text-zinc-700 max-h-64 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setCategory("General");
                          setSubCategory("");
                          setIsDropdownOpen(false);
                          setExpandedCategory(null);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors ${
                          category === "General"
                            ? "bg-zinc-50 font-semibold text-black"
                            : ""
                        }`}
                      >
                        General
                      </button>

                      <div>
                        <div
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === "Food" ? null : "Food"
                            )
                          }
                          className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors flex items-center justify-between cursor-pointer ${
                            category === "Food"
                              ? "bg-zinc-50 font-semibold text-black"
                              : ""
                          }`}
                        >
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategory("Food");
                              setSubCategory("Food");
                              setIsDropdownOpen(false);
                              setExpandedCategory(null);
                            }}
                          >
                            Food
                          </span>
                          <FiChevronDown
                            size={12}
                            className={`text-zinc-400 transition-transform ${
                              expandedCategory === "Food" ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                        {expandedCategory === "Food" && (
                          <div className="bg-zinc-50/80 py-1 border-y border-zinc-100">
                            {[
                              "Breakfast",
                              "Lunch & Dinner",
                              "Desserts",
                              "Candy",
                              "Snacks",
                            ].map((sub) => (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => {
                                  setCategory("Food");
                                  setSubCategory(sub);
                                  setIsDropdownOpen(false);
                                  setExpandedCategory(null);
                                }}
                                className={`w-full text-left pl-7 pr-3.5 py-1.5 hover:bg-zinc-200/50 transition-colors text-zinc-600 ${
                                  subCategory === sub
                                    ? "font-semibold text-black bg-zinc-200/40"
                                    : ""
                                }`}
                              >
                                └ {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCategory("Supplements");
                          setSubCategory("");
                          setIsDropdownOpen(false);
                          setExpandedCategory(null);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors ${
                          category === "Supplements"
                            ? "bg-zinc-50 font-semibold text-black"
                            : ""
                        }`}
                      >
                        Supplements
                      </button>

                      <div>
                        <div
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === "Training" ? null : "Training"
                            )
                          }
                          className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors flex items-center justify-between cursor-pointer ${
                            category === "Training"
                              ? "bg-zinc-50 font-semibold text-black"
                              : ""
                          }`}
                        >
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategory("Training");
                              setSubCategory("Training");
                              setIsDropdownOpen(false);
                              setExpandedCategory(null);
                            }}
                          >
                            Training
                          </span>
                          <FiChevronDown
                            size={12}
                            className={`text-zinc-400 transition-transform ${
                              expandedCategory === "Training" ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                        {expandedCategory === "Training" && (
                          <div className="bg-zinc-50/80 py-1 border-y border-zinc-100">
                            {[
                              "Cardio",
                              "Lifting",
                              "CrossFit",
                              "Powerlifting",
                              "Running",
                              "Other",
                            ].map((sub) => (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => {
                                  setCategory("Training");
                                  setSubCategory(sub);
                                  setIsDropdownOpen(false);
                                  setExpandedCategory(null);
                                }}
                                className={`w-full text-left pl-7 pr-3.5 py-1.5 hover:bg-zinc-200/50 transition-colors text-zinc-600 ${
                                  subCategory === sub
                                    ? "font-semibold text-black bg-zinc-200/40"
                                    : ""
                                }`}
                              >
                                └ {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === "Music" ? null : "Music"
                            )
                          }
                          className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors flex items-center justify-between cursor-pointer ${
                            category === "Music"
                              ? "bg-zinc-50 font-semibold text-black"
                              : ""
                          }`}
                        >
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategory("Music");
                              setSubCategory("Music");
                              setIsDropdownOpen(false);
                              setExpandedCategory(null);
                            }}
                          >
                            Music
                          </span>
                          <FiChevronDown
                            size={12}
                            className={`text-zinc-400 transition-transform ${
                              expandedCategory === "Music" ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                        {expandedCategory === "Music" && (
                          <div className="bg-zinc-50/80 py-1 border-y border-zinc-100">
                            {[
                              "Electronic",
                              "Rock",
                              "HipHop",
                              "Pop",
                              "R&B",
                              "Reggaeton",
                              "Other",
                            ].map((sub) => (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => {
                                  setCategory("Music");
                                  setSubCategory(sub);
                                  setIsDropdownOpen(false);
                                  setExpandedCategory(null);
                                }}
                                className={`w-full text-left pl-7 pr-3.5 py-1.5 hover:bg-zinc-200/50 transition-colors text-zinc-600 ${
                                  subCategory === sub
                                    ? "font-semibold text-black bg-zinc-200/40"
                                    : ""
                                }`}
                              >
                                └ {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCategory("Activewear");
                          setSubCategory("");
                          setIsDropdownOpen(false);
                          setExpandedCategory(null);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors ${
                          category === "Activewear"
                            ? "bg-zinc-50 font-semibold text-black"
                            : ""
                        }`}
                      >
                        Activewear
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCategory("Mindset & Recovery");
                          setSubCategory("");
                          setIsDropdownOpen(false);
                          setExpandedCategory(null);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors ${
                          category === "Mindset & Recovery"
                            ? "bg-zinc-50 font-semibold text-black"
                            : ""
                        }`}
                      >
                        Mindset & Recovery
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCategory("Helpme");
                          setSubCategory("");
                          setIsDropdownOpen(false);
                          setExpandedCategory(null);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-zinc-100 transition-colors ${
                          category === "Helpme"
                            ? "bg-zinc-50 font-semibold text-black"
                            : ""
                        }`}
                      >
                        Helpme
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;