import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiUserPlus, FiClock, FiCalendar } from 'react-icons/fi';
import { dashboardService } from '../services/dashboard.service';
import { useAuth } from '../context/AuthContext';

const Tile = (props) => {
  const Icon = props.icon;
  return (
    <button
      onClick={props.onClick}
      className="flex-1 bg-[#1a1c23] rounded-xl p-4 text-left hover:bg-[#20222b] transition-colors"
    >
      <Icon className="text-purple-500 mb-2" size={20} />
      <div className="text-2xl font-semibold text-white">{props.value}</div>
      <div className="text-sm text-gray-400">{props.label}</div>
    </button>
  );
};

export default function DashboardStats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardService.getStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="flex gap-3 mb-4">
      <Tile
        icon={FiMessageCircle}
        value={stats.unreadMessages}
        label="Unread messages"
        onClick={() => navigate('/chat')}
      />
      <Tile
        icon={FiUserPlus}
        value={stats.pendingConnectionRequests}
        label="Pending requests"
        onClick={() => navigate('/chat')}
      />
      {user?.role === 'mentor' && (
        <Tile
          icon={FiClock}
          value={stats.pendingSessionRequests}
          label="Session requests"
          onClick={() => navigate('/sessions')}
        />
      )}
      <Tile
        icon={FiCalendar}
        value={stats.upcomingSessions}
        label="Upcoming sessions"
        onClick={() => navigate('/sessions')}
      />
    </div>
  );
}
