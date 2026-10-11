import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import ScrollReveal from './ScrollReveal';

const MENTEE_POINTS = [
  'Get matched by skill overlap, not a browse-and-hope directory',
  'Book sessions around real, published availability',
  'Ask questions live, with chat and attachments',
];

const MENTOR_POINTS = [
  'Set your own availability — mentor on your schedule',
  'Build a visible rating and review history',
  'Reach mentees who already fit your expertise',
];

export default function AudienceSplit() {
  return (
    <section id="for-mentors" className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-6">
        <ScrollReveal>
          <Card raised className="h-full p-8">
            <p className="text-overline uppercase tracking-wide text-brand font-semibold">For mentees</p>
            <h3 className="mt-2 text-h3 font-display font-bold text-text">Learn from people who've done it.</h3>
            <ul className="mt-6 space-y-3">
              {MENTEE_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-body-sm text-text-muted">
                  <Check size={16} className="shrink-0 mt-0.5 text-brand" />
                  {point}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="inline-block mt-8">
              <Button variant="secondary">Join as a mentee</Button>
            </Link>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Card raised className="h-full p-8">
            <p className="text-overline uppercase tracking-wide text-accent font-semibold">For mentors</p>
            <h3 className="mt-2 text-h3 font-display font-bold text-text">Share what you know.</h3>
            <ul className="mt-6 space-y-3">
              {MENTOR_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-body-sm text-text-muted">
                  <Check size={16} className="shrink-0 mt-0.5 text-accent" />
                  {point}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="inline-block mt-8">
              <Button variant="secondary">Join as a mentor</Button>
            </Link>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
