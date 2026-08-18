import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { X, Calendar } from 'lucide-react';
import { sessionService } from '../services/session.service';
import { reviewService } from '../services/review.service';
import { useSocket } from '../contexts/SocketContext';
import StarRating from './StarRating';

const formatSlotTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1c23] rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Calendar size={20} className="text-purple-500" />
              Book a session with {mentor.username}
            </h3>
            {mentor.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1 ml-7">
                <StarRating rating={mentor.averageRating} readOnly size={13} />
                <span className="text-xs text-gray-500">{mentor.averageRating.toFixed(1)} ({mentor.reviewCount} reviews)</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mb-4 max-h-32 overflow-y-auto space-y-2 border-b border-[#282c3a] pb-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="text-sm">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} readOnly size={12} />
                  <span className="text-gray-400 text-xs">{review.mentee?.username}</span>
                </div>
                {review.comment && <p className="text-gray-400 text-xs mt-0.5">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">
            {mentor.username} hasn't added any available time slots yet.
          </p>
        ) : (
          <form onSubmit={handleBook}>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {slots.map((slot) => (
                <label
                  key={slot._id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                    selectedSlotId === slot._id ? 'bg-purple-600/20 border border-purple-500' : 'bg-[#282c3a] border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot"
                    value={slot._id}
                    checked={selectedSlotId === slot._id}
                    onChange={() => setSelectedSlotId(slot._id)}
                    className="accent-purple-600"
                  />
                  <span className="text-sm text-gray-200">
                    {formatSlotTime(slot.startTime)} – {new Date(slot.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </label>
              ))}
            </div>

            <label className="block text-sm text-gray-300 mb-2">What do you want to discuss? (optional)</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
              placeholder="e.g. React performance, career advice..."
              className="w-full bg-[#282c3a] rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              type="submit"
              disabled={!selectedSlotId || submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg transition"
            >
              {submitting ? 'Booking...' : 'Request session'}
            </button>
          </form>
        )}
      </div>
    </div>
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
