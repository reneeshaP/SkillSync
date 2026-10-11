import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const RadioGroup = forwardRef(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-2', className)} {...props} />
));
RadioGroup.displayName = 'RadioGroup';
RadioGroup.propTypes = { className: PropTypes.string };

const RadioGroupItem = forwardRef(({ className, children, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      children
        ? 'relative block rounded-lg border border-border bg-surface-raised text-left data-[state=checked]:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        : 'h-4 w-4 shrink-0 rounded-full border border-border bg-surface-raised data-[state=checked]:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...props}
  >
    {children}
    <RadioGroupPrimitive.Indicator
      className={
        children
          ? 'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-fg'
          : 'flex items-center justify-center relative after:block after:h-2 after:w-2 after:rounded-full after:bg-brand'
      }
    >
      {children && <Check size={12} strokeWidth={3} />}
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = 'RadioGroupItem';
RadioGroupItem.propTypes = { className: PropTypes.string, children: PropTypes.node };

export { RadioGroup, RadioGroupItem };
