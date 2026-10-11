import { Card } from '../ui/Card';
import ScrollReveal from './ScrollReveal';

const TESTIMONIALS = [
  {
    quote: 'Having someone a step ahead of me review my portfolio made more difference than any course did.',
    role: 'Mentee, frontend track',
  },
  {
    quote: 'Mentoring on my own schedule, with sessions booked straight off my availability, is the only reason I kept it up.',
    role: 'Mentor, backend & infra',
  },
  {
    quote: 'The matching actually looked at what I listed as skills instead of just sorting people alphabetically.',
    role: 'Mentee, product design',
  },
];

export default function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
      <ScrollReveal>
        <h2 className="text-h2 font-display font-bold text-text text-center">Early feedback from the community.</h2>
      </ScrollReveal>

      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <ScrollReveal key={t.role} delay={i * 0.08}>
            <Card className="h-full p-6">
              <p className="text-body-sm text-text">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-caption text-text-subtle">— {t.role}</p>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
