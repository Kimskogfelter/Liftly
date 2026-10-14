import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";

function RecipeForm({ 
  recipeTitle, setRecipeTitle, 
  prepTimeMinutes, setPrepTimeMinutes, 
  calories, setCalories, 
  protein, setProtein, 
  ingredients, setIngredients, 
  instructions, setInstructions, 
  onSave, onCancel, onClear
}) {
  const [errorMsg, setErrorMsg] = useState("");

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    if (typeof newIngredients[index] === 'object' && newIngredients[index] !== null) {
      newIngredients[index] = { ...newIngredients[index], name: value };
    } else {
      newIngredients[index] = value;
    }
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSaveClick = () => {
    setErrorMsg("");

    if (!recipeTitle || !recipeTitle.trim()) {
      setErrorMsg("Please enter a recipe title");
      return;
    }
    if (prepTimeMinutes === "" || prepTimeMinutes === undefined) {
      setErrorMsg("Please enter preparation time");
      return;
    }
    if (calories === "" || calories === undefined) {
      setErrorMsg("Please enter calories");
      return;
    }
    if (protein === "" || protein === undefined) {
      setErrorMsg("Please enter protein");
      return;
    }
    
    const hasEmptyIngredients = ingredients.length === 0 || ingredients.some(ing => {
      const val = typeof ing === 'object' ? ing?.name : ing;
      return !val || !val.trim();
    });

    if (hasEmptyIngredients) {
      setErrorMsg("Please fill in all ingredients");
      return;
    }

    if (instructions.length === 0 || instructions.some(step => !step || !step.trim())) {
      setErrorMsg("Please fill in all instruction steps");
      return;
    }

    onSave();
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Rubrik & Tillbaka */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h4 className="text-xs font-bold text-gray-900">Add Recipe</h4>
        <button 
          type="button" 
          onClick={onCancel} 
          className="text-xs text-zinc-500 hover:text-black cursor-pointer font-medium"
        >
          ← Back to post
        </button>
      </div>

      {/* Felmeddelande */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-2 rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {/* Recepttitel */}
      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Recipe Title *</label>
        <input
          type="text"
          placeholder="e.g., Chicken Sandwich"
          value={recipeTitle}
          onChange={(e) => setRecipeTitle(e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400 shadow-2xs"
        />
      </div>

      {/* Tid & Makros */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Time (min) *</label>
          <input
            type="number"
            placeholder="10"
            value={prepTimeMinutes}
            onChange={(e) => setPrepTimeMinutes(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Calories *</label>
          <input
            type="number"
            placeholder="350"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Protein (g) *</label>
          <input
            type="number"
            placeholder="30"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400"
          />
        </div>
      </div>

      {/* --- INGREDIENSER --- */}
      <div className="space-y-2 pt-1">
        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ingredients *</label>

        {ingredients.map((ing, index) => {
          const val = typeof ing === 'object' && ing !== null ? (ing.name || "") : ing;
          return (
            <div key={index} className="bg-zinc-50/70 border border-zinc-200/80 rounded-xl p-3 flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="e.g. 300g chicken breast"
                value={val}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
              >
                <FaRegTrashAlt size={14} />
              </button>
            </div>
          );
        })}

        {/* Add Ingredient Knapp (Matchar träningsdelarnas stil) */}
        <button
          type="button"
          onClick={addIngredient}
          className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
        >
          <FiPlus size={14} /> Add Ingredient
        </button>
      </div>

      {/* --- INSTRUKTIONER --- */}
      <div className="space-y-2 pt-2">
        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Instructions / Steps *</label>

        {instructions.map((step, index) => (
          <div key={index} className="bg-zinc-50/70 border border-zinc-200/80 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs font-bold text-zinc-400 shrink-0">{index + 1}.</span>
              <input
                type="text"
                placeholder={`Describe step ${index + 1}`}
                value={step || ""}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400 shadow-2xs"
              />
            </div>
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
            >
              <FaRegTrashAlt size={14} />
            </button>
          </div>
        ))}

        {/* Add Step Knapp (Matchar träningsdelarnas stil) */}
        <button
          type="button"
          onClick={addInstruction}
          className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
        >
          <FiPlus size={14} /> Add Step
        </button>
      </div>

      {/* --- KNAPPAR LÄNGST NER --- */}
      <div className="pt-6 pb-2 mt-4 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
        >
          Clear all
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="bg-[#3A3939] hover:bg-zinc-800 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
          >
            Save Recipe
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeForm;