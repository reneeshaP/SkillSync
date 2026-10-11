// Motion tokens for Framer Motion `transition` props. CSS custom properties
// alone aren't readable by Framer Motion, so these are the JS-side companion
// to the easing/duration scale described in the design brief.

export const EASE_OUT = [0.22, 1, 0.36, 1]; // quint ease-out — entrances
export const EASE_IN_OUT = [0.76, 0, 0.24, 1]; // quart ease-in-out — transforms

export const DURATION = {
  micro: 0.12,
  default: 0.2,
  overlay: 0.32,
};

export const fadeRise = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: DURATION.default, ease: EASE_OUT },
};
