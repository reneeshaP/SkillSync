import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiZap, FiMessageCircle, FiCalendar, FiClock } from 'react-icons/fi';
import { mentorService } from '../services/mentor.service';
import { useAuth } from '../context/AuthContext';
import BookSessionModal from '../components/BookSessionModal';
import StarRating from '../components/StarRating';

const API_URL = 'http://localhost:8000';

export default function People() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMentor, setBookingMentor] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await mentorService.getRecommendations();
        setMatches(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
  };

  const targetLabel = user?.role === 'mentor' ? 'Mentees' : 'Mentors';

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
            title="Back to home"
          >
            <FiArrowLeft size={22} />
          </button>
          <FiZap className="text-purple-500" size={22} />
          <h1 className="text-2xl font-bold flex-1">{targetLabel} matched for you</h1>
          <button
            onClick={() => navigate('/sessions')}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FiClock size={16} /> My Sessions
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-[#1a1c23] rounded-xl p-6 text-gray-400">{error}</div>
        ) : matches.length === 0 ? (
          <div className="bg-[#1a1c23] rounded-xl p-6 text-gray-400">
            No matches yet — {user?.role === 'mentor' ? 'mentees' : 'mentors'} need to fill in their skills and bio first.
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(({ user: matchedUser, matchPercent }) => (
              <div
                key={matchedUser._id}
                className="bg-[#1a1c23] rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {matchedUser.avatar ? (
                    <img
                      src={getAvatarUrl(matchedUser.avatar)}
                      className="w-12 h-12 rounded-full object-cover"
                      alt={matchedUser.username}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center font-semibold">
                      {matchedUser.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{matchedUser.username}</h3>
                    {matchedUser.role === 'mentor' && matchedUser.reviewCount > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StarRating rating={matchedUser.averageRating} readOnly size={13} />
                        <span className="text-xs text-gray-500">
                          {matchedUser.averageRating.toFixed(1)} ({matchedUser.reviewCount})
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {matchedUser.bio || matchedUser.skills?.join(', ') || 'No bio yet'}
                    </p>
                    {matchedUser.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {matchedUser.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                    {matchPercent}% match
                  </span>
                  {matchedUser.role === 'mentor' && (
                    <button
                      onClick={() => setBookingMentor(matchedUser)}
                      className="flex items-center gap-1 bg-[#282c3a] hover:bg-[#323744] transition px-3 py-1.5 rounded-lg text-sm"
                      title="Book a session"
                    >
                      <FiCalendar size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/chat', {
                      state: { userId: matchedUser._id, username: matchedUser.username }
                    })}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 transition px-3 py-1.5 rounded-lg text-sm"
                  >
                    <FiMessageCircle size={16} />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookingMentor && (
        <BookSessionModal
          mentor={bookingMentor}
          onClose={() => setBookingMentor(null)}
          onBooked={() => alert(`Session request sent to ${bookingMentor.username}! You'll be notified when they respond.`)}
        />
      )}
    </div>
  );
}
