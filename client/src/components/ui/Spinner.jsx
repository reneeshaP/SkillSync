import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const SIZES = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

function Spinner({ size = 'md', className, label = 'Loading' }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'animate-spin rounded-full border-t-2 border-b-2 border-brand',
        SIZES[size],
        className
      )}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  label: PropTypes.string,
};

export { Spinner };
