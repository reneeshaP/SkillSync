import PropTypes from 'prop-types';
import { Avatar } from './Avatar';
import { cn } from '../../lib/utils';

function AvatarGroup({ users, max = 4, size = 'sm', className }) {
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {shown.map((u) => (
        <Avatar
          key={u._id || u.userId}
          src={u.avatar}
          name={u.username}
          userId={u._id || u.userId}
          size={size}
          className="ring-2 ring-bg rounded-full"
        />
      ))}
      {overflow > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-overlay text-caption font-medium text-text-muted ring-2 ring-bg">
          +{overflow}
        </div>
      )}
    </div>
  );
}

AvatarGroup.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      userId: PropTypes.string,
      username: PropTypes.string,
      avatar: PropTypes.string,
    })
  ).isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

export { AvatarGroup };
