import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const PRODUCT_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#for-mentors', label: 'For mentors' },
];

export default function LandingFooter() {
  const scrollTo = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid sm:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SkillSync" className="w-7 h-7 object-contain" />
              <span className="font-display font-bold text-text">SkillSync</span>
            </div>
            <p className="mt-3 text-body-sm text-text-muted">Mentor and mentee matching, done by skill.</p>
          </div>

          <div>
            <p className="text-overline uppercase tracking-wide text-text-subtle font-semibold">Product</p>
            <ul className="mt-3 space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollTo(e, link.href)}
                    className="text-body-sm text-text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-overline uppercase tracking-wide text-text-subtle font-semibold">Account</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/login" className="text-body-sm text-text-muted hover:text-text transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-body-sm text-text-muted hover:text-text transition-colors">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-overline uppercase tracking-wide text-text-subtle font-semibold">Legal</p>
            <ul className="mt-3 space-y-2">
              <li className="text-body-sm text-text-subtle">Privacy Policy (coming soon)</li>
              <li className="text-body-sm text-text-subtle">Terms of Service (coming soon)</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-text-subtle">&copy; {new Date().getFullYear()} SkillSync. All rights reserved.</p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
