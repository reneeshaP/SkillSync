import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

function scorePassword(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LABELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
const BAR_COLORS = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;
  const score = scorePassword(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full bg-surface-overlay', i < score && BAR_COLORS[score])}
          />
        ))}
      </div>
      <p className="mt-1 text-caption text-text-subtle">{LABELS[score]}</p>
    </div>
  );
}

PasswordStrengthMeter.propTypes = {
  password: PropTypes.string,
};
