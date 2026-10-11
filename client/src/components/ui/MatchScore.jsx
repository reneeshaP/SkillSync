import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

// A %-meter reserved for AI/match signals — uses the accent teal token, never
// the brand purple, so matching reads as its own visual language.
function MatchScore({ percent, size = 40, strokeWidth = 4, className }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}% match`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-surface-overlay"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none stroke-accent transition-[stroke-dashoffset] duration-[320ms]"
        />
      </svg>
      <span className="absolute text-caption font-semibold text-text">{percent}%</span>
    </div>
  );
}

MatchScore.propTypes = {
  percent: PropTypes.number.isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  className: PropTypes.string,
};

export { MatchScore };
