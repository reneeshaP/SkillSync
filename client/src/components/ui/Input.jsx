import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-body text-text placeholder-text-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
};

export { Input };
