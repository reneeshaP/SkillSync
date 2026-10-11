import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <EmptyState
        icon={Compass}
        title="Page not found"
        body="The page you're looking for doesn't exist or may have moved."
        actionLabel="Back to Feed"
        onAction={() => navigate('/feed')}
      />
    </div>
  );
}
