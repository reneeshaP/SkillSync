import PropTypes from 'prop-types';
import { FiCalendar, FiUserPlus, FiMessageCircle } from 'react-icons/fi';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { MatchScore } from './ui/MatchScore';
import StarRating from './StarRating';
import { formatRelativeSlot } from '../lib/datetime';
import { cn } from '../lib/utils';

export default function MatchCard({ match, compact, onHeaderClick, onConnect, onBook }) {
  const { user: matchedUser, matchPercent } = match;
  const hasSlot = matchedUser.role === 'mentor' && !!matchedUser.nextAvailableSlot;

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onHeaderClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onHeaderClick();
        }
      }}
      className={cn(
        'flex items-start justify-between gap-3 cursor-pointer text-left transition-colors',
        compact
          ? 'bg-surface-overlay rounded-lg p-3 hover:bg-border'
          : 'bg-surface border border-border rounded-xl p-4 gap-4 hover:border-border-strong'
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={matchedUser.avatar}
          name={matchedUser.username}
          userId={matchedUser._id}
          size={compact ? 'md' : 'lg'}
        />
        <div>
          <h3 className={cn('hover:underline', compact ? 'font-medium' : 'font-semibold')}>{matchedUser.username}</h3>
          {matchedUser.role === 'mentor' && matchedUser.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarRating rating={matchedUser.averageRating} readOnly size={compact ? 12 : 13} />
              <span className="text-xs text-text-subtle">
                {matchedUser.averageRating.toFixed(1)}{!compact && ` (${matchedUser.reviewCount})`}
              </span>
            </div>
          )}
          <p className="text-sm text-text-muted line-clamp-1">
            {matchedUser.bio || matchedUser.skills?.join(', ') || 'No bio yet'}
          </p>
          {!compact && matchedUser.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {matchedUser.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="brand" size="sm">{skill}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0 max-w-[220px]">
        <MatchScore percent={matchPercent} size={compact ? 32 : 40} strokeWidth={3} />

        {matchedUser.role === 'mentor' && (
          hasSlot ? (
            <p className="text-xs text-text-muted text-right">{formatRelativeSlot(matchedUser.nextAvailableSlot)}</p>
          ) : (
            !compact && <p className="text-xs text-text-subtle text-right">No slots available yet</p>
          )
        )}

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {hasSlot && (
            <button
              onClick={stop(() => onBook(matchedUser))}
              className={cn(
                'flex items-center gap-1 bg-surface-overlay hover:bg-border transition rounded-lg whitespace-nowrap',
                compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
              )}
            >
              <FiCalendar size={compact ? 14 : 16} />
              Book a slot right now
            </button>
          )}
          <button
            onClick={stop(() => onConnect(matchedUser))}
            className={cn(
              'flex items-center gap-1 bg-brand text-brand-fg hover:bg-brand-hover transition rounded-lg whitespace-nowrap',
              compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
            )}
          >
            {matchedUser.isConnected ? (
              <>
                <FiMessageCircle size={compact ? 14 : 16} />
                Message
              </>
            ) : (
              <>
                <FiUserPlus size={compact ? 14 : 16} />
                Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

MatchCard.propTypes = {
  match: PropTypes.shape({
    matchPercent: PropTypes.number.isRequired,
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      bio: PropTypes.string,
      skills: PropTypes.array,
      role: PropTypes.string,
      averageRating: PropTypes.number,
      reviewCount: PropTypes.number,
      nextAvailableSlot: PropTypes.object,
      isConnected: PropTypes.bool,
    }).isRequired,
  }).isRequired,
  compact: PropTypes.bool,
  onHeaderClick: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
  onBook: PropTypes.func,
};

MatchCard.defaultProps = {
  compact: false,
};
