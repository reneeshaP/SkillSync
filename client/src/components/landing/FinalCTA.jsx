import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import ScrollReveal from './ScrollReveal';

export default function FinalCTA() {
  return (
    <section className="border-t border-border bg-brand-subtle">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 text-center">
        <ScrollReveal>
          <h2 className="text-h2 font-display font-bold text-text">Ready to find your match?</h2>
          <p className="mt-3 text-body-lg text-text-muted">
            Create a profile in a couple of minutes and get matched right away.
          </p>
          <Link to="/signup" className="inline-block mt-8">
            <Button variant="primary" size="lg">Get started free</Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
