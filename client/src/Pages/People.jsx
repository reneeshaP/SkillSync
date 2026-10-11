import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiClock, FiGrid, FiList } from 'react-icons/fi';
import { mentorService } from '../services/mentor.service';
import { connectionService } from '../services/connection.service';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import notificationService from '../services/notification.service';
import BookSessionModal from '../components/BookSessionModal';
import MatchCard from '../components/MatchCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { IconButton } from '../components/ui/IconButton';
import { toast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

const MatchCardSkeleton = () => (
  <div className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4">
    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
  </div>
);

export default function People() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMentor, setBookingMentor] = useState(null);
  const [sortBy, setSortBy] = useState('match');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [compact, setCompact] = useState(false);

  const viewingMentors = user?.role !== 'mentor';

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mentorService.getRecommendations();
      setMatches(data);
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
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const targetLabel = user?.role === 'mentor' ? 'Mentees' : 'Mentors';

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

  const visibleMatches = useMemo(() => {
    let list = matches;
    if (availableOnly) {
      list = list.filter((m) => !!m.user.nextAvailableSlot);
    }
    list = [...list];
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.user.averageRating || 0) - (a.user.averageRating || 0));
    } else if (sortBy === 'availability') {
      list.sort((a, b) => {
        if (!a.user.nextAvailableSlot) return 1;
        if (!b.user.nextAvailableSlot) return -1;
        return new Date(a.user.nextAvailableSlot.startTime) - new Date(b.user.nextAvailableSlot.startTime);
      });
    } else {
      list.sort((a, b) => b.matchPercent - a.matchPercent);
    }
    return list;
  }, [matches, sortBy, availableOnly]);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FiZap className="text-purple-500" size={22} />
          <h1 className="text-2xl font-bold flex-1">{targetLabel} matched for you</h1>
          <button
            onClick={() => navigate('/sessions')}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FiClock size={16} /> My Sessions
          </button>
        </div>

        {!loading && !error && matches.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto h-9 gap-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best match</SelectItem>
                {viewingMentors && <SelectItem value="rating">Highest rated</SelectItem>}
                {viewingMentors && <SelectItem value="availability">Available soonest</SelectItem>}
              </SelectContent>
            </Select>

            {viewingMentors && (
              <label className="flex items-center gap-2 text-text-muted cursor-pointer">
                <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
                Available now only
              </label>
            )}

            <div className="ml-auto flex items-center gap-1">
              <IconButton
                aria-label="Comfortable view"
                onClick={() => setCompact(false)}
                className={cn(!compact && 'bg-surface-overlay text-text')}
              >
                <FiList size={16} />
              </IconButton>
              <IconButton
                aria-label="Compact view"
                onClick={() => setCompact(true)}
                className={cn(compact && 'bg-surface-overlay text-text')}
              >
                <FiGrid size={16} />
              </IconButton>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        ) : error ? (
          <ErrorState title="Couldn't load your matches" body={error} onRetry={fetchMatches} />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={FiZap}
            title="No matches yet"
            body={`${user?.role === 'mentor' ? 'Mentees' : 'Mentors'} need to fill in their skills and bio first.`}
          />
        ) : (
          <div className="space-y-3">
            {visibleMatches.map((match) => (
              <MatchCard
                key={match.user._id}
                match={match}
                compact={compact}
                onHeaderClick={() => navigate(`/profile/${match.user._id}`)}
                onConnect={handleConnect}
                onBook={setBookingMentor}
              />
            ))}
          </div>
        )}
      </div>

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
