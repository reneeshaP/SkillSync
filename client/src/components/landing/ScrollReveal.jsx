import { useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { EASE_OUT, DURATION } from '../../lib/motion';

const MotionDiv = motion.div;

export default function ScrollReveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();

  return (
    <MotionDiv
      ref={ref}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: DURATION.overlay, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
}

ScrollReveal.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  delay: PropTypes.number,
};
