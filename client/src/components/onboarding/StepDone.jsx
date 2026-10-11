import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { EASE_OUT } from '../../lib/motion';

const MotionDiv = motion.div;

export default function StepDone({ onFinish }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="text-center py-6">
      <MotionDiv
        initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success"
      >
        <Check size={32} strokeWidth={3} />
      </MotionDiv>
      <h2 className="text-h3 font-display font-bold text-text mb-2">You're all set!</h2>
      <p className="text-text-muted mb-8">Your profile is ready — let's find your matches.</p>
      <Button variant="primary" size="lg" onClick={onFinish}>
        Go to your feed
      </Button>
    </div>
  );
}

StepDone.propTypes = {
  onFinish: PropTypes.func.isRequired,
};
