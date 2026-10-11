import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

export default function AuthLayout({ children, panel, panelTitle, panelSubtitle, panelPoints }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SkillSync" className="w-7 h-7 object-contain" />
          <span className="font-display font-bold text-text">SkillSync</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center bg-brand-subtle px-12 py-16">
          {panel ?? (
            <>
              <div>
                <h2 className="text-h2 font-display font-bold text-text text-balance">{panelTitle}</h2>
                <p className="mt-3 text-body-lg text-text-muted max-w-sm">{panelSubtitle}</p>
              </div>
              <ul className="mt-10 space-y-4">
                {panelPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-body-sm text-text">
                    <Check className="shrink-0 mt-0.5 text-brand" size={18} />
                    {point}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="flex items-center justify-center p-4 py-12">{children}</div>
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node,
  panel: PropTypes.node,
  panelTitle: PropTypes.string,
  panelSubtitle: PropTypes.string,
  panelPoints: PropTypes.arrayOf(PropTypes.string),
};
