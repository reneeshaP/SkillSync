import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import HeroMock from './HeroMock';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(var(--color-text) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-h1 md:text-display font-display font-extrabold text-text text-balance">
            Get matched with the mentor who actually fits you.
          </h1>
          <p className="mt-5 text-body-lg text-text-muted max-w-md">
            SkillSync pairs mentors and mentees by skills and goals with AI-driven matching, then gets you straight to scheduled sessions and real-time chat.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup">
              <Button variant="primary" size="lg">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Log in</Button>
            </Link>
          </div>
        </div>

        <HeroMock />
      </div>
    </section>
  );
}
