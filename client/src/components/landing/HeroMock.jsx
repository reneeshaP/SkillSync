import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Check } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { MatchScore } from '../ui/MatchScore';
import { EASE_OUT } from '../../lib/motion';

const MotionDiv = motion.div;

export default function HeroMock() {
  const reduceMotion = useReducedMotion();
  const stagger = reduceMotion ? 0 : 0.35;

  return (
    <div className="relative h-[360px] md:h-[420px]" aria-hidden="true">
      <MotionDiv
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="absolute left-0 top-0 w-72 rounded-2xl border border-border bg-surface-raised shadow-lg p-4"
      >
        <div className="flex items-center gap-3">
          <Avatar name="Priya N." userId="hero-mock-1" size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text text-body-sm">Priya N.</p>
            <p className="text-caption text-text-subtle truncate">React · Node.js · Systems design</p>
          </div>
          <MatchScore percent={92} size={40} strokeWidth={3} />
        </div>
      </MotionDiv>

      <MotionDiv
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: stagger }}
        className="absolute left-8 top-[150px] md:top-[170px] flex items-center gap-2 rounded-2xl rounded-bl-sm bg-brand text-brand-fg px-4 py-2.5 shadow-lg max-w-[240px]"
      >
        <MessageCircle size={16} className="shrink-0" />
        <p className="text-body-sm">Could we go over your portfolio Thursday?</p>
      </MotionDiv>

      <MotionDiv
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: stagger * 2 }}
        className="absolute right-0 bottom-0 w-64 rounded-2xl border border-border bg-surface-raised shadow-lg p-4"
      >
        <p className="text-caption text-text-subtle">Thu, Oct 16 · 4:00–4:30 PM</p>
        <p className="mt-1 font-medium text-text text-body-sm">Portfolio review session</p>
        <Badge variant="success" size="sm" className="mt-3">
          <Check size={12} /> Confirmed
        </Badge>
      </MotionDiv>
    </div>
  );
}
