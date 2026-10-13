import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CiSearch } from "react-icons/ci";

function SearchBar() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    // Försök tvinga fokus direkt samt via en kort timer
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    focusInput();
    const timer = setTimeout(focusInput, 150);

    return () => clearTimeout(timer);
  }, []);

  // Extra säkerhetsåtgärd för mobil: om hela sökarean nuddas, tvinga fokus
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div 
        className="relative w-full cursor-text" 
        onClick={handleContainerClick}
        onTouchStart={handleContainerClick}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, tags or people..."
          className="w-full h-10 pl-10 pr-4 text-sm rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:shadow-sm"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <CiSearch size={18} className="text-gray-400" />
        </div>
      </div>
    </form>
  );
}

export default SearchBar;