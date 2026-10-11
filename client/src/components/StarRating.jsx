import { useState } from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

export default function StarRating({ rating, onChange, size = 16, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const displayRating = hovered || rating;

  const handleKeyDown = (e, star) => {
    if (readOnly || !onChange) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(5, star + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, star - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(star);
    }
  };

  if (readOnly) {
    return (
      <div
        role="img"
        aria-label={`${rating.toFixed(1)} out of 5 stars`}
        className="flex items-center gap-0.5"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercent = Math.max(0, Math.min(1, rating - (star - 1))) * 100;
          return (
            <span key={star} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 fill-transparent text-gray-500" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                <Star size={size} className="fill-yellow-400 text-yellow-400" />
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === Math.round(rating)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          tabIndex={star === (Math.round(rating) || 1) ? 0 : -1}
          onClick={() => onChange?.(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <Star
            size={size}
            className={star <= displayRating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-gray-500'}
          />
        </button>
      ))}
    </div>
  );
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  size: PropTypes.number,
  readOnly: PropTypes.bool,
};
