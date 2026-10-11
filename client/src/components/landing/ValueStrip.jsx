import ScrollReveal from './ScrollReveal';

const VALUES = [
  'Matched on skills, not keywords',
  'Free while in beta',
  'Built for mentors and mentees alike',
];

export default function ValueStrip() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid sm:grid-cols-3 gap-6 text-center">
        {VALUES.map((value, i) => (
          <ScrollReveal key={value} delay={i * 0.08}>
            <p className="text-body font-medium text-text">{value}</p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
