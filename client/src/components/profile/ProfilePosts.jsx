import PropTypes from 'prop-types';
import { FiMessageCircle } from 'react-icons/fi';
import PostCard from '../PostCard';
import { EmptyState } from '../ui/EmptyState';

export default function ProfilePosts({ posts, currentUserId, onLike, onSave, onShare, onSaveEdit, onDelete, onCommentUpdate }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-6">My Posts</h1>
      {posts.length === 0 ? (
        <EmptyState icon={FiMessageCircle} title="No posts yet" body="You haven't created any posts yet." />
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
            showOwnerActions
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
            allowCommentEdit
            onCommentUpdate={onCommentUpdate}
          />
        ))
      )}
    </div>
  );
}

ProfilePosts.propTypes = {
  posts: PropTypes.array.isRequired,
  currentUserId: PropTypes.string,
  onLike: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
};
