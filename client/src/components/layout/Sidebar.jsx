import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, LogOut, Settings as SettingsIcon, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDashboardStats } from '../../contexts/DashboardStatsContext';
import { getNavItems } from './navItems';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/Tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/DropdownMenu';
import ThemeToggle from '../ThemeToggle';
import NotificationBell from '../NotificationBell';
import { cn } from '../../lib/utils';

const MotionDiv = motion.div;
const COLLAPSE_KEY = 'skillsync-sidebar-collapsed';
const THEME_CYCLE = { light: 'dark', dark: 'system', system: 'light' };

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const { socket } = useSocket();
  const { theme, setTheme } = useTheme();
  const { stats } = useDashboardStats();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');

  const navItems = getNavItems(user?.role);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  const handleLogout = () => {
    socket?.disconnect();
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <TooltipProvider delayDuration={300}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
      >
        Skip to content
      </a>

      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 shrink-0 border-r border-border bg-surface transition-[width] duration-200',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className={cn('flex items-center gap-2 p-4', collapsed && 'justify-center px-0')}>
          <img src="/logo.png" alt="SkillSync" className="w-8 h-8 object-contain shrink-0" />
          {!collapsed && <span className="font-display font-bold text-text">SkillSync</span>}
        </div>

        <div className={cn('px-3', collapsed && 'px-2')}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="primary"
                  size="icon"
                  className="w-full"
                  aria-label="Create post"
                  onClick={() => navigate('/create-post')}
                >
                  <Plus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create post</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="primary" className="w-full" onClick={() => navigate('/create-post')}>
              <Plus size={18} /> Create post
            </Button>
          )}
        </div>

        <nav className="flex-1 mt-4 px-3 space-y-1" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const badgeCount = item.badgeKey ? stats?.[item.badgeKey] : null;
            const Icon = item.icon;

            const link = (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive ? 'text-brand bg-brand-subtle' : 'text-text-muted hover:text-text hover:bg-surface-overlay'
                )}
              >
                {isActive && (
                  <MotionDiv
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-brand"
                  />
                )}
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && !!badgeCount && (
                  <Badge variant="brand" size="sm">{badgeCount}</Badge>
                )}
                {collapsed && !!badgeCount && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand" />
                )}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
            <ThemeToggle />
            <NotificationBell dropUp />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-surface-overlay transition-colors',
                  collapsed && 'justify-center'
                )}
              >
                <Avatar src={user?.avatar} name={user?.username} userId={user?._id} size="sm" />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-text">{user?.username}</p>
                    <Badge variant="neutral" size="sm" className="capitalize">{user?.role}</Badge>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align={collapsed ? 'center' : 'start'}>
              <DropdownMenuItem onSelect={() => navigate('/userprofile')}>
                <UserCircle size={16} /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/userprofile?tab=security')}>
                <SettingsIcon size={16} /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme(THEME_CYCLE[theme])}>
                Theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={handleLogout}>
                <LogOut size={16} /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-md p-2 text-text-subtle hover:text-text hover:bg-surface-overlay transition-colors'
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
