import PropTypes from 'prop-types';
import { FiBookmark } from 'react-icons/fi';
import PostCard from '../PostCard';
import { EmptyState } from '../ui/EmptyState';

export default function ProfileSaved({ posts, currentUserId, onLike, onSave, onShare, onCommentUpdate }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">Saved Posts</h1>
      {posts.length === 0 ? (
        <EmptyState icon={FiBookmark} title="No saved posts yet" body="Posts you save will show up here." />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            showEngagement
            onLike={onLike}
            onSave={onSave}
            onShare={onShare}
            onCommentUpdate={onCommentUpdate}
          />
        ))
      )}
    </div>
  );
}

ProfileSaved.propTypes = {
  posts: PropTypes.array.isRequired,
  currentUserId: PropTypes.string,
  onLike: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
};
