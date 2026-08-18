import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCheck, FiX, FiStar } from 'react-icons/fi';
import { sessionService } from '../services/session.service';
import { reviewService } from '../services/review.service';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import StarRating from '../components/StarRating';

const API_URL = 'http://localhost:8000';

const getAvatarUrl = (avatarPath, fallbackName) => {
  if (!avatarPath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || '?')}`;
  return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
};

const formatSlotTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const STATUS_STYLES = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  confirmed: 'bg-green-500/10 text-green-400',
  declined: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-gray-500/10 text-gray-400'
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
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-yellow-400 transition mt-3"
      >
        <FiStar size={16} /> Rate this mentor
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 bg-[#282c3a] rounded-lg p-3">
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <p className="text-sm text-gray-300 mb-2">
            {existingReview ? 'Edit your review of' : 'Rate'} {session.mentor.username}
          </p>
          <StarRating rating={rating} onChange={setRating} size={22} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Optional comment..."
            className="w-full bg-[#1a1c23] rounded-lg px-3 py-2 text-white text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={!rating || submitting}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm transition"
            >
              {submitting ? 'Saving...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
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

export default function Sessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket: socketContext } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
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
      alert(err.response?.data?.message || 'Failed to respond to session');
    }
  };

  const handleCancel = async (session) => {
    if (!confirm('Cancel this session?')) return;
    try {
      await sessionService.cancelSession(session._id);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors" title="Back to home">
            <FiArrowLeft size={22} />
          </button>
          <FiCalendar className="text-purple-500" size={22} />
          <h1 className="text-2xl font-bold">My Sessions</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        {sessions.length === 0 ? (
          <div className="bg-[#1a1c23] rounded-xl p-6 text-gray-400">
            No sessions yet. {user?.role === 'mentee' ? 'Book one from a mentor match on the People page.' : 'Add availability slots so mentees can book a session with you.'}
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const isMentor = session.mentor._id === user._id;
              const otherUser = isMentor ? session.mentee : session.mentor;

              return (
                <div key={session._id} className="bg-[#1a1c23] rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(otherUser.avatar, otherUser.username)}
                        alt={otherUser.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{otherUser.username}</h3>
                        <p className="text-sm text-gray-400">{formatSlotTime(session.slot.startTime)}</p>
                        {session.topic && <p className="text-sm text-gray-500 mt-1">"{session.topic}"</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[session.status]}`}>
                      {session.status}
                    </span>
                  </div>

                  {session.status === 'pending' && isMentor && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleRespond(session, true)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 transition px-3 py-1.5 rounded-lg text-sm"
                      >
                        <FiCheck size={16} /> Confirm
                      </button>
                      <button
                        onClick={() => handleRespond(session, false)}
                        className="flex items-center gap-1 bg-[#282c3a] hover:bg-[#323744] transition px-3 py-1.5 rounded-lg text-sm"
                      >
                        <FiX size={16} /> Decline
                      </button>
                    </div>
                  )}

                  {(session.status === 'pending' || session.status === 'confirmed') && !(session.status === 'pending' && isMentor) && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleCancel(session)}
                        className="text-sm text-gray-400 hover:text-red-400 transition"
                      >
                        Cancel session
                      </button>
                    </div>
                  )}

                  {session.status === 'confirmed' && !isMentor && (
                    <RateMentorSection session={session} onRated={fetchSessions} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
