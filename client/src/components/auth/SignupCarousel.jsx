import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { EASE_OUT } from '../../lib/motion';

const MotionDiv = motion.div;

const SLIDES = [
  {
    title: 'Connect, Learn, and Grow Together',
    body: 'Start your journey of growth and learning',
  },
  {
    body: 'SkillSync brings together mentors and learners in a collaborative community. Share knowledge, develop skills, and build meaningful connections.',
  },
  {
    title: "Let's Get Started",
    cta: true,
  },
];

const INTERVAL = 5000;

export default function SignupCarousel({ onGetStarted }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [paused, reduceMotion]);

  const go = (step) => setIndex((prev) => (prev + step + SLIDES.length) % SLIDES.length);
  const slide = SLIDES[index];

  return (
    <div
      className="relative w-full min-h-[320px] flex flex-col justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        onClick={() => go(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-surface-overlay hover:bg-border rounded-full p-2 transition-colors"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-5 h-5 text-text" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-surface-overlay hover:bg-border rounded-full p-2 transition-colors"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-5 h-5 text-text" />
      </button>

      <AnimatePresence mode="wait">
        <MotionDiv
          key={index}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="px-12 text-center"
        >
          {slide.title && (
            <h2 className="text-h3 font-display font-bold text-text mb-3 text-balance">{slide.title}</h2>
          )}
          {slide.body && <p className="text-body-lg text-text-muted leading-relaxed">{slide.body}</p>}
          {slide.cta && (
            <button
              onClick={onGetStarted}
              className="mt-6 bg-brand text-brand-fg px-8 py-3 rounded-full text-body-lg font-semibold hover:bg-brand-hover transition-colors"
            >
              Get Started
            </button>
          )}
        </MotionDiv>
      </AnimatePresence>

      <div className="flex justify-center gap-2 mt-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-brand' : 'w-2 bg-border'}`}
          />
        ))}
      </div>
    </div>
  );
}

SignupCarousel.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
};
