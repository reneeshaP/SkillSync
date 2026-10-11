import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'skillsync-theme';

const ThemeContext = createContext(undefined);

const getSystemPrefersLight = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches;

// Dark is the default for a visitor with no stored preference, regardless of
// their OS setting. Only an explicit "light" choice (or "system" currently
// resolving to light) is not dark.
const resolve = (theme) => {
  if (theme === 'light') return 'light';
  if (theme === 'system') return getSystemPrefersLight() ? 'light' : 'dark';
  return 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [resolvedTheme, setResolvedTheme] = useState(() => resolve(theme));

  const applyResolved = useCallback((next) => {
    setResolvedTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, []);

  const setTheme = useCallback(
    (next) => {
      setThemeState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage unavailable — theme just won't persist across reloads
      }
      applyResolved(resolve(next));
    },
    [applyResolved]
  );

  // Keep in sync with the OS theme when the user has chosen "system".
  useEffect(() => {
    if (theme !== 'system') return undefined;
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => applyResolved(resolve('system'));
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [theme, applyResolved]);

  // Reconcile with whatever the no-flash inline script in index.html already
  // applied, in case it and this computed value ever disagree.
  useEffect(() => {
    applyResolved(resolve(theme));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
