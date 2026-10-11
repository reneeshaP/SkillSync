import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = forwardRef(({ className, sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 rounded-lg border border-border bg-surface-raised p-4 shadow-lg focus:outline-none',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = 'PopoverContent';
PopoverContent.propTypes = { className: PropTypes.string, sideOffset: PropTypes.number };

export { Popover, PopoverTrigger, PopoverContent };
