import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const MotionDiv = motion.div;

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('flex gap-1 border-b border-border overflow-x-auto', className)}
    {...props}
  />
));
TabsList.displayName = 'TabsList';
TabsList.propTypes = { className: PropTypes.string };

// `activeValue` (the Tabs.Root's current value) is passed down so only the
// active trigger renders the animated underline — avoids needing a second
// render pass to detect which trigger is "selected".
const TabsTrigger = forwardRef(({ className, value, activeValue, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    value={value}
    className={cn(
      'relative whitespace-nowrap px-4 py-2.5 text-body-sm font-medium text-text-muted transition-colors data-[state=active]:text-text focus-visible:outline-none',
      className
    )}
    {...props}
  >
    {children}
    {activeValue === value && (
      <MotionDiv layoutId="tabs-indicator" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />
    )}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = 'TabsTrigger';
TabsTrigger.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  activeValue: PropTypes.string,
  children: PropTypes.node,
};

const TabsContent = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('pt-4', className)} {...props} />
));
TabsContent.displayName = 'TabsContent';
TabsContent.propTypes = { className: PropTypes.string };

export { Tabs, TabsList, TabsTrigger, TabsContent };
