import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const IconButton = forwardRef(
  ({ className, 'aria-label': ariaLabel, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-overlay hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
IconButton.displayName = 'IconButton';

IconButton.propTypes = {
  className: PropTypes.string,
  'aria-label': PropTypes.string.isRequired,
  children: PropTypes.node,
};

export { IconButton };
