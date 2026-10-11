import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';
import { mentorService } from '../services/mentor.service';
import { connectionService } from '../services/connection.service';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import notificationService from '../services/notification.service';
import BookSessionModal from './BookSessionModal';
import MatchCard from './MatchCard';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { toast } from './ui/Toast';

export default function MentorRecommendations() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMentor, setBookingMentor] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mentorService.getRecommendations();
      setRecommendations(data);
      data.forEach(({ user: matchedUser }) => {
        if (matchedUser.role === 'mentor' && matchedUser.nextAvailableSlot) {
          notificationService.notifyMentorAvailable(matchedUser);
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations, user]);

  const handleConnect = async (matchedUser) => {
    if (!matchedUser.isConnected) {
      try {
        const request = await connectionService.sendRequest(matchedUser._id);
        socket?.emit('sendConnectionRequest', { receiverId: matchedUser._id, requestData: request });
      } catch (err) {
        console.error('Connection request error (continuing to chat):', err.response?.data?.message || err.message);
      }
    }
    navigate('/chat', { state: { userId: matchedUser._id, username: matchedUser.username } });
  };

  if (loading) return null;

  const targetLabel = user?.role === 'mentor' ? 'Mentees' : 'Mentors';

  return (
    <div className="bg-[#1a1c23] rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiZap className="text-purple-500" size={20} />
          <h2 className="font-semibold">{targetLabel} matched for you</h2>
        </div>
        <button
          onClick={() => navigate('/people')}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          See all
        </button>
      </div>

      {error ? (
        <ErrorState title="Couldn't load your matches" onRetry={fetchRecommendations} className="py-6" />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={FiZap}
          title="No matches yet"
          body={`${user?.role === 'mentor' ? 'Mentees' : 'Mentors'} need to fill in their skills and bio first.`}
          className="py-6"
        />
      ) : (
        <div className="space-y-3">
          {recommendations.map((match) => (
            <MatchCard
              key={match.user._id}
              match={match}
              compact
              onHeaderClick={() => navigate(`/profile/${match.user._id}`)}
              onConnect={handleConnect}
              onBook={setBookingMentor}
            />
          ))}
        </div>
      )}

      {bookingMentor && (
        <BookSessionModal
          mentor={bookingMentor}
          onClose={() => setBookingMentor(null)}
          onBooked={() => toast.success(`Session request sent to ${bookingMentor.username}! You'll be notified when they respond.`)}
        />
      )}
    </div>
  );
}
