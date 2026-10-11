import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const MotionOverlay = motion(DialogPrimitive.Overlay);
const MotionContentEl = motion(DialogPrimitive.Content);

const SIDE_CLASS = {
  bottom: 'inset-x-0 bottom-0 rounded-t-xl max-h-[85vh]',
  right: 'inset-y-0 right-0 h-full w-full max-w-sm',
  left: 'inset-y-0 left-0 h-full w-full max-w-sm',
};

const SIDE_MOTION = {
  bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
  left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
};

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;

const SheetContent = forwardRef(({ className, side = 'bottom', children, ...props }, ref) => (
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
        'fixed z-50 border border-border bg-surface-raised p-6 shadow-lg focus:outline-none overflow-y-auto',
        SIDE_CLASS[side],
        className
      )}
      {...SIDE_MOTION[side]}
      transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute right-4 top-4 text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <X size={18} />
      </DialogPrimitive.Close>
    </MotionContentEl>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';
SheetContent.propTypes = {
  className: PropTypes.string,
  side: PropTypes.oneOf(['bottom', 'right', 'left']),
  children: PropTypes.node,
};

export { Sheet, SheetTrigger, SheetContent };
