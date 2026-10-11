import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { EASE_OUT } from '../../lib/motion';

const MotionDiv = motion.div;

const STEPS = [
  {
    title: 'Create your profile',
    body: "Sign up and tell us your skills, goals, and experience — it takes a couple of minutes.",
  },
  {
    title: 'Get matched',
    body: 'We compare skills, bio, and experience with AI embeddings and rank the mentors or mentees who fit you best.',
  },
  {
    title: 'Book sessions and grow',
    body: 'Schedule time around real availability, chat in real time, and track progress together.',
  },
];

export default function HowItWorks() {
  const listRef = useRef(null);
  const inView = useInView(listRef, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <ScrollReveal>
        <p className="text-overline uppercase tracking-wide text-brand font-semibold">How it works</p>
        <h2 className="mt-2 text-h2 font-display font-bold text-text">Three steps from sign-up to session.</h2>
      </ScrollReveal>

      <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
        <ScrollReveal delay={0.1} className="rounded-2xl border border-border bg-surface-raised p-8">
          <img src="/getting-started-illustration.svg" alt="" className="w-full h-auto max-w-sm mx-auto" />
        </ScrollReveal>

        <div ref={listRef} className="relative space-y-8">
          <MotionDiv
            className="absolute left-4 top-4 bottom-4 w-px bg-border origin-top"
            initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
            animate={inView || reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            aria-hidden="true"
          />
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.title} delay={0.15 + i * 0.1} className="relative pl-12">
              <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-fg text-body-sm font-semibold">
                {i + 1}
              </span>
              <h3 className="text-h4 font-display font-semibold text-text">{step.title}</h3>
              <p className="mt-1 text-body-sm text-text-muted">{step.body}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
