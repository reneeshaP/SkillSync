import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full font-medium', {
  variants: {
    variant: {
      brand: 'bg-brand-subtle text-brand',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-danger/10 text-danger',
      info: 'bg-info/10 text-info',
      neutral: 'bg-surface-overlay text-text-muted',
    },
    size: {
      sm: 'px-2 py-0.5 text-caption',
      md: 'px-3 py-1 text-body-sm',
    },
  },
  defaultVariants: { variant: 'brand', size: 'md' },
});

function Badge({ className, variant, size, onRemove, removeLabel, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel || 'Remove'}
          className="hover:opacity-70"
        >
          <X size={size === 'sm' ? 12 : 14} />
        </button>
      )}
    </span>
  );
}

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['brand', 'success', 'warning', 'danger', 'info', 'neutral']),
  size: PropTypes.oneOf(['sm', 'md']),
  onRemove: PropTypes.func,
  removeLabel: PropTypes.string,
  children: PropTypes.node,
};

export { Badge, badgeVariants };
