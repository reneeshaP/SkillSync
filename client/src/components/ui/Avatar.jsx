import PropTypes from 'prop-types';
import { getAvatarUrl } from '../../lib/avatar';
import { cn } from '../../lib/utils';

const SIZES = { xs: 'h-6 w-6 text-xs', sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-28 w-28 text-2xl' };

// A small fixed palette, selected deterministically from the user's id, so
// the same person always gets the same color — replaces the three different
// avatar-fallback strategies (ui-avatars.com, i.pravatar.cc, ad hoc divs)
// that existed across 12 files.
const COLOR_CLASSES = ['bg-brand-400', 'bg-brand-600', 'bg-accent', 'bg-success', 'bg-info', 'bg-warning'];

function colorForId(id) {
  if (!id) return COLOR_CLASSES[0];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COLOR_CLASSES[hash % COLOR_CLASSES.length];
}

function initialsOf(name) {
  return (name || '?').trim().substring(0, 2).toUpperCase();
}

function Avatar({ src, name, userId, size = 'md', presence, className }) {
  const resolvedSrc = getAvatarUrl(src);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={name || ''}
          className={cn('rounded-full object-cover', SIZES[size])}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full font-semibold text-white',
            SIZES[size],
            colorForId(userId || name)
          )}
        >
          {initialsOf(name)}
        </div>
      )}
      {presence && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-bg',
            size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
            presence === 'online' ? 'bg-success' : 'bg-text-subtle'
          )}
        />
      )}
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  userId: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  presence: PropTypes.oneOf(['online', 'offline']),
  className: PropTypes.string,
};

export { Avatar };
