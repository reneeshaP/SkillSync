import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../../contexts/DashboardStatsContext';
import { getNavItems } from './navItems';
import { cn } from '../../lib/utils';

export default function MobileBottomBar() {
  const { user } = useAuth();
  const { stats } = useDashboardStats();
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        const badgeCount = item.badgeKey ? stats?.[item.badgeKey] : null;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-caption font-medium transition-colors',
              isActive ? 'text-brand' : 'text-text-muted'
            )}
          >
            <span className="relative">
              <Icon size={20} />
              {!!badgeCount && (
                <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-brand" />
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
