import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const MotionOverlay = motion(DialogPrimitive.Overlay);
const MotionContentEl = motion(DialogPrimitive.Content);

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogContent = forwardRef(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <MotionOverlay
      className="fixed inset-0 z-50 bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
    <MotionContentEl
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface-raised p-6 shadow-lg focus:outline-none',
        className
      )}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute right-4 top-4 text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <X size={18} />
        </DialogPrimitive.Close>
      )}
    </MotionContentEl>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';
DialogContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  showClose: PropTypes.bool,
};

const DialogTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-h4 font-display font-semibold text-text', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';
DialogTitle.propTypes = { className: PropTypes.string };

const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-body-sm text-text-muted mt-1', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';
DialogDescription.propTypes = { className: PropTypes.string };

export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription };
