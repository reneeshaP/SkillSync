import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiUsers } from 'react-icons/fi';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/ui/ProgressBar';
import { toast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export default function ChooseRole() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleChoose = async (role) => {
    setSelected(role);
    setSubmitting(true);
    try {
      const updatedUser = await authService.confirmRole(role);
      setUser((prev) => ({ ...prev, ...updatedUser }));
      navigate('/feed');
    } catch (err) {
      toast.error(err.message || 'Failed to set role');
      setSubmitting(false);
      setSelected(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <p className="text-overline uppercase tracking-wide text-brand font-semibold mb-2">
          Step 1 of 2
        </p>
        <ProgressBar value={1} max={2} label="Onboarding progress" className="mb-8" />

        <h1 className="text-h2 font-display font-bold text-text mb-2">
          Welcome{user?.username ? `, ${user.username}` : ''}!
        </h1>
        <p className="text-text-muted mb-10">One last thing — how do you want to use SkillSync?</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleChoose('mentee')}
            disabled={submitting}
            className={cn(
              'group rounded-2xl border border-border bg-surface-raised p-6 text-center transition-all hover:border-brand hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0',
              selected === 'mentee' && 'border-brand ring-2 ring-ring'
            )}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-subtle text-brand transition-transform group-hover:scale-105">
              <FiUser size={28} />
            </div>
            <h3 className="font-display font-semibold text-text">I'm a Mentee</h3>
            <p className="text-body-sm text-text-muted mt-1">I want to learn from mentors</p>
          </button>

          <button
            onClick={() => handleChoose('mentor')}
            disabled={submitting}
            className={cn(
              'group rounded-2xl border border-border bg-surface-raised p-6 text-center transition-all hover:border-accent hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0',
              selected === 'mentor' && 'border-accent ring-2 ring-ring'
            )}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-105">
              <FiUsers size={28} />
            </div>
            <h3 className="font-display font-semibold text-text">I'm a Mentor</h3>
            <p className="text-body-sm text-text-muted mt-1">I want to help others grow</p>
          </button>
        </div>
      </div>
    </div>
  );
}
