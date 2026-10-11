import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded-md bg-surface-overlay px-2 py-1 text-caption text-text shadow-md',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';
TooltipContent.propTypes = { className: PropTypes.string, sideOffset: PropTypes.number };

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
