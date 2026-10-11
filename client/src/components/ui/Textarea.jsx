import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-body text-text placeholder-text-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  className: PropTypes.string,
};

export { Textarea };
