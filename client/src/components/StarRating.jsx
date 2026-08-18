import { useState } from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

export default function StarRating({ rating, onChange, size = 16, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const displayRating = hovered || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
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
  readOnly: PropTypes.bool
};
