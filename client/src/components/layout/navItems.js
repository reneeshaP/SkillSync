import { Home, Users, MessageCircle, Calendar, User } from 'lucide-react';

// Single source of truth for the primary nav, consumed by both the desktop
// sidebar and the mobile bottom bar so the list is never duplicated.
export const getNavItems = (role) => [
  { to: '/feed', label: 'Feed', icon: Home, badgeKey: null },
  { to: '/people', label: role === 'mentor' ? 'Mentees' : 'Mentors', icon: Users, badgeKey: 'pendingConnectionRequests' },
  { to: '/chat', label: 'Messages', icon: MessageCircle, badgeKey: 'unreadMessages' },
  { to: '/sessions', label: 'Sessions', icon: Calendar, badgeKey: role === 'mentor' ? 'pendingSessionRequests' : null },
  { to: '/userprofile', label: 'Profile', icon: User, badgeKey: null },
];
