import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiGithub, FiLinkedin, FiLink, FiMessageCircle, FiUserPlus, FiCheck, FiCalendar } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { profileService } from "../services/profile.service";
import { connectionService } from "../services/connection.service";
import { reviewService } from "../services/review.service";
import { sessionService } from "../services/session.service";
import StarRating from "../components/StarRating";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { getAvatarUrl } from "../lib/avatar";
import { formatRelativeSlot } from "../lib/datetime";
import { toast } from "../components/ui/Toast";
import BookSessionModal from "../components/BookSessionModal";

export default function ViewProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [slots, setSlots] = useState([]);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (id === currentUser?._id) {
      navigate("/userprofile", { replace: true });
      return;
    }

    let cancelled = false;
    profileService
      .getUserProfile(id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setLoading(false);
        socket?.emit('sendProfileView', { profileOwnerId: id, viewerName: currentUser?.username });

        if (data.role === 'mentor') {
          reviewService.getMentorReviews(id).then(setReviews).catch(() => {});
          sessionService.getMentorAvailability(id).then(setSlots).catch(() => {});
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Failed to load profile");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleConnect = async () => {
    try {
      const request = await connectionService.sendRequest(id);
      socket?.emit('sendConnectionRequest', { receiverId: id, requestData: request });
      toast.success("Connection request sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send connection request");
    }
  };

  const handleMessage = () => {
    navigate('/chat', { state: { userId: id, username: profile.username } });
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f1117]" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const hasSlots = slots.length > 0;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-8 pb-28 md:pb-8">
      <div className="max-w-2xl mx-auto bg-[#1a1c23] rounded-xl p-6 shadow-lg text-center">
        <Avatar
          src={profile.avatar}
          name={profile.username}
          userId={id}
          size="xl"
          className="border-4 border-purple-600 rounded-full mx-auto"
        />
        <h2 className="mt-4 text-xl font-bold">{profile.username}</h2>
        <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs bg-purple-600/20 text-purple-400 font-medium">
          {profile.role === 'mentor' ? 'Mentor' : 'Mentee'}
        </span>

        {profile.role === 'mentor' && profile.reviewCount > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <StarRating rating={profile.averageRating} readOnly size={14} />
            <span className="text-sm text-gray-400">{profile.averageRating.toFixed(1)} ({profile.reviewCount})</span>
          </div>
        )}

        <div className="flex justify-center space-x-4 mt-4">
          {profile.socialLinks?.github && (
            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              <FiGithub size={20} />
            </a>
          )}
          {profile.socialLinks?.linkedin && (
            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              <FiLinkedin size={20} />
            </a>
          )}
          {profile.resume?.url && (
            <a href={getAvatarUrl(profile.resume.url)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              <FiLink size={20} />
            </a>
          )}
        </div>

        {/* Sticky on mobile, inline on desktop */}
        <div className="hidden md:flex justify-center gap-3 mt-6">
          {profile.isConnected ? (
            <span className="flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-lg">
              <FiCheck size={16} /> Connected
            </span>
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
            >
              <FiUserPlus size={16} /> Connect
            </button>
          )}
          <button
            onClick={handleMessage}
            className="flex items-center gap-2 bg-[#282c3a] hover:bg-[#323744] px-4 py-2 rounded-lg transition"
          >
            <FiMessageCircle size={16} /> Message
          </button>
          {hasSlots && (
            <button
              onClick={() => setBooking(true)}
              className="flex items-center gap-2 bg-[#282c3a] hover:bg-[#323744] px-4 py-2 rounded-lg transition"
            >
              <FiCalendar size={16} /> Book
            </button>
          )}
        </div>

        <div className="mt-8 text-left space-y-6">
          <div>
            <h3 className="font-semibold text-gray-200">Bio</h3>
            <p className="text-sm text-gray-400 mt-1">{profile.bio || "No bio yet."}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200">
              {profile.role === 'mentee' ? 'Skills They Want to Learn' : 'Skills They Offer'}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {(profile.skills || []).map((skill) => (
                <Badge key={skill} variant="brand">{skill}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200">Experience</h3>
            <p className="text-sm text-gray-400 mt-1">{profile.experience || "Not specified"}</p>
          </div>

          {profile.role === 'mentor' && (
            <div>
              <h3 className="font-semibold text-gray-200">Available slots</h3>
              {hasSlots ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {slots.slice(0, 6).map((slot) => (
                    <span key={slot._id} className="text-xs bg-[#282c3a] text-gray-300 px-3 py-1.5 rounded-full">
                      {formatRelativeSlot(slot)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-1">No slots available yet.</p>
              )}
            </div>
          )}

          {profile.role === 'mentor' && (
            <div>
              <h3 className="font-semibold text-gray-200">Reviews</h3>
              {reviews.length > 0 ? (
                <div className="mt-2 space-y-3">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-[#282c3a] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} readOnly size={13} />
                        <span className="text-gray-400 text-xs">{review.mentee?.username}</span>
                      </div>
                      {review.comment && <p className="text-gray-400 text-sm mt-1">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-1">No reviews yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky action row on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1c23] border-t border-gray-800 p-4 flex gap-2 z-40">
        {profile.isConnected ? (
          <span className="flex-1 flex items-center justify-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-lg">
            <FiCheck size={16} /> Connected
          </span>
        ) : (
          <button
            onClick={handleConnect}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
          >
            <FiUserPlus size={16} /> Connect
          </button>
        )}
        <button
          onClick={handleMessage}
          className="flex-1 flex items-center justify-center gap-2 bg-[#282c3a] hover:bg-[#323744] px-4 py-2 rounded-lg transition"
        >
          <FiMessageCircle size={16} /> Message
        </button>
        {hasSlots && (
          <button
            onClick={() => setBooking(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#282c3a] hover:bg-[#323744] px-4 py-2 rounded-lg transition"
          >
            <FiCalendar size={16} /> Book
          </button>
        )}
      </div>

      {booking && (
        <BookSessionModal
          mentor={profile}
          onClose={() => setBooking(false)}
          onBooked={() => {
            setBooking(false);
            toast.success(`Session request sent to ${profile.username}! You'll be notified when they respond.`);
          }}
        />
      )}
    </div>
  );
}
