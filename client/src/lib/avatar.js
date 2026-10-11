// Single source of truth for resolving an uploaded avatar/image path to a
// full URL — replaces 12 near-duplicate local implementations across the
// app (three different fallback strategies: ui-avatars.com, i.pravatar.cc,
// and ad hoc initials divs). The actual initials-circle fallback now lives
// in <Avatar>, not here — this helper only ever resolves real image paths.

import { API_ORIGIN } from './env';

export function getAvatarUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
}
