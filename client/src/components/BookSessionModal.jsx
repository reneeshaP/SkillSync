import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar } from 'lucide-react';
import { sessionService } from '../services/session.service';
import { reviewService } from '../services/review.service';
import { useSocket } from '../contexts/SocketContext';
import { formatRelativeSlot } from '../lib/datetime';
import StarRating from './StarRating';
import { Dialog, DialogContent, DialogTitle } from './ui/Dialog';
import { RadioGroup, RadioGroupItem } from './ui/RadioGroup';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';

export default function BookSessionModal({ mentor, onClose, onBooked }) {
  const { socket: socketContext } = useSocket();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const data = await sessionService.getMentorAvailability(mentor._id);
        setSlots(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load available times');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();

    reviewService.getMentorReviews(mentor._id).then(setReviews).catch(() => {});
  }, [mentor._id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) return;
    setSubmitting(true);
    setError('');

    try {
      const session = await sessionService.bookSession(selectedSlotId, topic);

      if (socketContext) {
        socketContext.emit('sendSessionRequest', {
          mentorId: mentor._id,
          sessionData: session
        });
      }

      onBooked?.(session);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogTitle className="flex items-center gap-2">
          <Calendar size={20} className="text-brand" />
          Book a session with {mentor.username}
        </DialogTitle>
        {mentor.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mt-1 ml-7">
            <StarRating rating={mentor.averageRating} readOnly size={13} />
            <span className="text-caption text-text-subtle">{mentor.averageRating.toFixed(1)} ({mentor.reviewCount} reviews)</span>
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger text-danger rounded-lg p-3 mt-4 text-body-sm">
            {error}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto space-y-2 border-b border-border pb-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="text-body-sm">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} readOnly size={12} />
                  <span className="text-text-subtle text-caption">{review.mentee?.username}</span>
                </div>
                {review.comment && <p className="text-text-subtle text-caption mt-0.5">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ) : slots.length === 0 ? (
          <p className="text-text-muted text-body-sm py-4">
            {mentor.username} hasn't added any available time slots yet.
          </p>
        ) : (
          <form onSubmit={handleBook} className="mt-4">
            <RadioGroup value={selectedSlotId} onValueChange={setSelectedSlotId} className="max-h-60 overflow-y-auto mb-4 pr-1">
              {slots.map((slot) => (
                <RadioGroupItem key={slot._id} value={slot._id} className="px-3 py-2.5 pr-10 mb-2 last:mb-0">
                  <span className="text-body-sm text-text">{formatRelativeSlot(slot)}</span>
                </RadioGroupItem>
              ))}
            </RadioGroup>

            <label htmlFor="session-topic" className="block text-body-sm text-text-muted mb-2">
              What do you want to discuss? (optional)
            </label>
            <Textarea
              id="session-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
              placeholder="e.g. React performance, career advice..."
              className="mb-4"
            />

            <Button type="submit" variant="primary" className="w-full" disabled={!selectedSlotId} loading={submitting}>
              {submitting ? 'Booking...' : 'Request session'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

BookSessionModal.propTypes = {
  mentor: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onBooked: PropTypes.func
};
