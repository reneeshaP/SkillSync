import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiUserPlus, FiClock, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../contexts/DashboardStatsContext';
import { Skeleton } from './ui/Skeleton';
import { ErrorState } from './ui/ErrorState';

const Tile = (props) => {
  const Icon = props.icon;
  return (
    <button
      onClick={props.onClick}
      className="flex-1 min-w-[140px] bg-[#1a1c23] rounded-xl p-4 text-left hover:bg-[#20222b] transition-colors"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-subtle text-brand mb-2">
        <Icon size={18} />
      </div>
      <div className="text-2xl font-semibold text-white">{props.value}</div>
      <div className="text-sm text-gray-400">{props.label}</div>
    </button>
  );
};

const TileSkeleton = () => (
  <div className="flex-1 min-w-[140px] bg-[#1a1c23] rounded-xl p-4">
    <Skeleton className="h-9 w-9 rounded-full mb-2" />
    <Skeleton className="h-7 w-10 mb-2" />
    <Skeleton className="h-4 w-24" />
  </div>
);

export default function DashboardStats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, error, refetch } = useDashboardStats();

  if (error) {
    return <ErrorState title="Couldn't load your stats" onRetry={refetch} className="py-6" />;
  }

  if (!stats) {
    return (
      <div className="flex gap-3 mb-4 overflow-x-auto lg:flex-col lg:overflow-visible">
        <TileSkeleton />
        <TileSkeleton />
        <TileSkeleton />
        <TileSkeleton />
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4 overflow-x-auto lg:flex-col lg:overflow-visible">
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
