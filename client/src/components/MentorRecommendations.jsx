import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiMessageCircle } from 'react-icons/fi';
import { mentorService } from '../services/mentor.service';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

const API_URL = 'http://localhost:8000';

export default function MentorRecommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await mentorService.getRecommendations();
        setRecommendations(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
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
        <p className="text-sm text-gray-400">{error}</p>
      ) : recommendations.length === 0 ? (
        <p className="text-sm text-gray-400">
          No matches yet — {user?.role === 'mentor' ? 'mentees' : 'mentors'} need to fill in their skills and bio first.
        </p>
      ) : (
        <div className="space-y-3">
          {recommendations.map(({ user: matchedUser, matchPercent }) => (
            <div
              key={matchedUser._id}
              className="flex items-center justify-between bg-[#282c3a] rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                {matchedUser.avatar ? (
                  <img
                    src={getAvatarUrl(matchedUser.avatar)}
                    className="w-10 h-10 rounded-full object-cover"
                    alt={matchedUser.username}
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center font-semibold">
                    {matchedUser.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{matchedUser.username}</h3>
                  {matchedUser.role === 'mentor' && matchedUser.reviewCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StarRating rating={matchedUser.averageRating} readOnly size={12} />
                      <span className="text-xs text-gray-500">{matchedUser.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {matchedUser.bio || matchedUser.skills?.join(', ') || 'No bio yet'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                  {matchPercent}% match
                </span>
                <button
                  onClick={() => navigate('/chat', { state: { userId: matchedUser._id, username: matchedUser.username } })}
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                  title={`Message ${matchedUser.username}`}
                >
                  <FiMessageCircle size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
