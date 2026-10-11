import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

const MotionSpan = motion.span;

const NEXT = { light: 'dark', dark: 'system', system: 'light' };
const ICON = { light: Sun, dark: Moon, system: Monitor };
const LABEL = { light: 'Light', dark: 'Dark', system: 'System' };

export default function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();
  const Icon = ICON[theme];
  const next = NEXT[theme];

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={() => setTheme(next)}
            aria-label={`Switch to ${LABEL[next]} theme`}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-overlay hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              className
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <MotionSpan
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex"
              >
                <Icon size={18} />
              </MotionSpan>
            </AnimatePresence>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            sideOffset={6}
            className="z-50 rounded-md bg-surface-overlay px-2 py-1 text-caption text-text shadow-md"
          >
            {LABEL[theme]} theme — click for {LABEL[next]}
            <Tooltip.Arrow className="fill-surface-overlay" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
};
