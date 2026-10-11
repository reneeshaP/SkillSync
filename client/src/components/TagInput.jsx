import { useState } from "react";
import PropTypes from "prop-types";
import { FiX } from "react-icons/fi";

// Controlled chip/tag input: Enter or comma commits a chip, Backspace on an
// empty field removes the last one. When `suggestions` is provided, typing
// also shows a job-portal-style autocomplete dropdown, navigable with arrow
// keys. `showHints`/`maxCount` are opt-in additions (default off/unlimited)
// so existing consumers render identically unless they ask for more.
export default function TagInput({ value, onChange, placeholder, suggestions = [], maxCount, showHints = false }) {
  const [draft, setDraft] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const atMax = typeof maxCount === "number" && value.length >= maxCount;

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed) && !(typeof maxCount === "number" && value.length >= maxCount)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
    setHighlightedIndex(-1);
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const filteredSuggestions = draft.trim()
    ? suggestions
        .filter(
          (s) =>
            s.toLowerCase().includes(draft.trim().toLowerCase()) &&
            !value.includes(s)
        )
        .slice(0, 8)
    : [];

  const quickAddSuggestions = suggestions.filter((s) => !value.includes(s)).slice(0, 8);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" && filteredSuggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp" && filteredSuggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        addTag(filteredSuggestions[highlightedIndex]);
      } else {
        addTag(draft);
      }
    } else if (e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Escape") {
      setHighlightedIndex(-1);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="relative">
      <div
        className="w-full bg-[#1a1c23] rounded-lg px-3 py-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-purple-600"
        onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
      >
        {value.map((tag, i) => (
          <span
            key={tag}
            className="bg-purple-600/20 text-purple-400 pl-3 pr-1.5 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              <FiX size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            addTag(draft);
          }}
          disabled={atMax}
          placeholder={atMax ? `Max ${maxCount} reached` : value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-gray-200 placeholder-gray-500 py-1 disabled:cursor-not-allowed"
        />
      </div>

      {showHints && draft.trim() && !atMax && (
        <p className="mt-1 text-xs text-gray-500">Press Enter to add &ldquo;{draft.trim()}&rdquo;</p>
      )}

      {isFocused && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-[#1a1c23] border border-gray-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filteredSuggestions.map((s, i) => {
            const matchStart = s.toLowerCase().indexOf(draft.trim().toLowerCase());
            const matchLen = draft.trim().length;
            const before = matchStart >= 0 ? s.slice(0, matchStart) : s;
            const match = matchStart >= 0 ? s.slice(matchStart, matchStart + matchLen) : "";
            const after = matchStart >= 0 ? s.slice(matchStart + matchLen) : "";
            return (
              <button
                type="button"
                key={s}
                // mousedown (not click) + preventDefault so the input's onBlur
                // doesn't fire and swallow the draft text before this registers.
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s);
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`w-full text-left px-3 py-2 text-sm text-gray-200 ${
                  i === highlightedIndex ? "bg-[#282c3a]" : "hover:bg-[#282c3a]"
                }`}
              >
                {before}
                <span className="text-purple-400 font-semibold">{match}</span>
                {after}
              </button>
            );
          })}
        </div>
      )}

      {showHints && !draft.trim() && !atMax && quickAddSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickAddSuggestions.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => addTag(s)}
              className="text-xs bg-[#1a1c23] hover:bg-[#282c3a] text-gray-300 px-2.5 py-1 rounded-full border border-gray-700 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

TagInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  maxCount: PropTypes.number,
  showHints: PropTypes.bool,
};
