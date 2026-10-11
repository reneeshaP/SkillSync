import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FiCalendar, FiCheck, FiX, FiStar } from 'react-icons/fi';
import { sessionService } from '../services/session.service';
import { reviewService } from '../services/review.service';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatRelativeSlot } from '../lib/datetime';
import StarRating from '../components/StarRating';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';

const STATUS_VARIANT = {
  pending: 'warning',
  confirmed: 'success',
  declined: 'danger',
  cancelled: 'neutral'
};

const RateMentorSection = ({ session, onRated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const mine = await reviewService.getMyReview(session.mentor._id);
      if (mine) {
        setExistingReview(mine);
        setRating(mine.rating);
        setComment(mine.comment || '');
      }
    } catch {
      // no existing review — leave form blank
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      await reviewService.submitReview(session.mentor._id, rating, comment, session._id);
      setOpen(false);
      onRated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 text-body-sm text-text-muted hover:text-warning transition mt-3"
      >
        <FiStar size={16} /> Rate this mentor
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 bg-surface-overlay rounded-lg p-3">
      {loading ? (
        <p className="text-body-sm text-text-muted">Loading...</p>
      ) : (
        <>
          <p className="text-body-sm text-text-muted mb-2">
            {existingReview ? 'Edit your review of' : 'Rate'} {session.mentor.username}
          </p>
          <StarRating rating={rating} onChange={setRating} size={22} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Optional comment..."
            className="mt-2"
          />
          <div className="flex gap-2 mt-2">
            <Button type="submit" variant="primary" size="sm" disabled={!rating} loading={submitting}>
              {submitting ? 'Saving...' : 'Submit'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

RateMentorSection.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    mentor: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  onRated: PropTypes.func
};

function SessionCard({ session, currentUserId, onRespond, onCancel, onRated }) {
  const isMentor = session.mentor._id === currentUserId;
  const otherUser = isMentor ? session.mentee : session.mentor;

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={otherUser.avatar} name={otherUser.username} userId={otherUser._id} size="md" />
          <div className="min-w-0">
            <h3 className="font-semibold text-text truncate">{otherUser.username}</h3>
            <p className="text-body-sm text-text-muted">{formatRelativeSlot(session.slot)}</p>
            {session.topic && <p className="text-body-sm text-text-subtle mt-1">"{session.topic}"</p>}
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[session.status]} size="sm" className="capitalize shrink-0">
          {session.status}
        </Badge>
      </div>

      {session.status === 'pending' && isMentor && (
        <div className="flex gap-2 mt-3">
          <Button variant="primary" size="sm" className="bg-success hover:opacity-90" onClick={() => onRespond(session, true)}>
            <FiCheck size={16} /> Confirm
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onRespond(session, false)}>
            <FiX size={16} /> Decline
          </Button>
        </div>
      )}

      {(session.status === 'pending' || session.status === 'confirmed') && !(session.status === 'pending' && isMentor) && (
        <div className="mt-3">
          <button
            onClick={() => onCancel(session)}
            className="text-body-sm text-text-muted hover:text-danger transition"
          >
            Cancel session
          </button>
        </div>
      )}

      {session.status === 'confirmed' && !isMentor && (
        <RateMentorSection session={session} onRated={onRated} />
      )}
    </div>
  );
}

SessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  currentUserId: PropTypes.string.isRequired,
  onRespond: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onRated: PropTypes.func.isRequired
};

export default function Sessions() {
  const { user } = useAuth();
  const { socket: socketContext } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('pending');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSessions = async () => {
    setError('');
    try {
      const data = await sessionService.getMySessions();
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRespond = async (session, accept) => {
    try {
      const updated = await sessionService.respondToSession(session._id, accept);

      if (socketContext) {
        socketContext.emit('sendSessionResponse', {
          menteeId: session.mentee._id,
          sessionData: updated
        });
      }

      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond to session');
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await sessionService.cancelSession(cancelTarget._id);
      setCancelTarget(null);
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel session');
    } finally {
      setCancelling(false);
    }
  };

  const { pending, upcoming, past } = useMemo(() => {
    const now = new Date();
    const groups = { pending: [], upcoming: [], past: [] };
    for (const session of sessions) {
      if (session.status === 'pending') {
        groups.pending.push(session);
      } else if (session.status === 'confirmed' && new Date(session.slot.startTime) >= now) {
        groups.upcoming.push(session);
      } else {
        groups.past.push(session);
      }
    }
    return groups;
  }, [sessions]);

  const renderList = (list, emptyBody) =>
    list.length === 0 ? (
      <EmptyState icon={FiCalendar} title="Nothing here yet" body={emptyBody} />
    ) : (
      <div className="space-y-3">
        {list.map((session) => (
          <SessionCard
            key={session._id}
            session={session}
            currentUserId={user._id}
            onRespond={handleRespond}
            onCancel={setCancelTarget}
            onRated={fetchSessions}
          />
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-bg text-text p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FiCalendar className="text-brand" size={22} />
          <h1 className="text-h3 font-display font-semibold">My Sessions</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : error ? (
          <ErrorState body={error} onRetry={fetchSessions} />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={FiCalendar}
            title="No sessions yet"
            body={user?.role === 'mentee' ? 'Book one from a mentor match on the People page.' : 'Add availability slots so mentees can book a session with you.'}
          />
        ) : (
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" activeValue={view}>Pending{pending.length > 0 ? ` (${pending.length})` : ''}</TabsTrigger>
              <TabsTrigger value="upcoming" activeValue={view}>Upcoming{upcoming.length > 0 ? ` (${upcoming.length})` : ''}</TabsTrigger>
              <TabsTrigger value="past" activeValue={view}>Past</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {renderList(pending, user?.role === 'mentee' ? 'No pending requests right now.' : 'No session requests waiting on you.')}
            </TabsContent>
            <TabsContent value="upcoming">
              {renderList(upcoming, 'No confirmed sessions on the calendar yet.')}
            </TabsContent>
            <TabsContent value="past">
              {renderList(past, 'Past and declined sessions will show up here.')}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this session?"
        description="This can't be undone — the other person will be notified."
        confirmLabel="Cancel session"
        cancelLabel="Keep session"
        onConfirm={handleCancel}
        loading={cancelling}
      />
    </div>
  );
}
