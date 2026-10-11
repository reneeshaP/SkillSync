import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import ThemeToggle from '../ThemeToggle';
import NotificationBell from '../NotificationBell';

export default function MobileTopBar() {
  const navigate = useNavigate();

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2.5">
      <img src="/logo.png" alt="SkillSync" className="w-7 h-7 object-contain" />
      <div className="flex items-center gap-1">
        <IconButton aria-label="Search matches" onClick={() => navigate('/people')}>
          <Search size={20} />
        </IconButton>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
