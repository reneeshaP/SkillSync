import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

function ProgressBar({ value, max = 100, className, label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-overlay', className)}
    >
      <div
        className="h-full rounded-full bg-brand transition-all duration-[320ms]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  className: PropTypes.string,
  label: PropTypes.string,
};

export { ProgressBar };
