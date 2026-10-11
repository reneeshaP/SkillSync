import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiThumbsUp, FiBookmark, FiSend, FiMoreVertical, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Comment from './Comment';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/DropdownMenu';
import { getAvatarUrl } from '../lib/avatar';
import { cn } from '../lib/utils';

const MotionSpan = motion.span;

export default function PostCard({
  post,
  currentUserId,
  clickableHeader,
  onHeaderClick,
  showEngagement,
  onLike,
  onSave,
  onShare,
  showOwnerActions,
  onSaveEdit,
  onDelete,
  allowCommentEdit,
  onCommentUpdate,
  onAddComment,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editTags, setEditTags] = useState(Array.isArray(post.tags) ? post.tags : []);
  const [showComposer, setShowComposer] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isOwner = post.userId?._id === currentUserId;
  const isLiked = post.likes?.includes(currentUserId);
  const isSaved = post.savedBy?.includes(currentUserId);

  const handleSaveEdit = async () => {
    try {
      await onSaveEdit(post._id, editContent.trim(), editTags);
      setIsEditing(false);
    } catch {
      // caller surfaces the error via its own error state; stay in edit mode
    }
  };

  const handleCancelEdit = () => {
    setEditContent(post.content);
    setEditTags(Array.isArray(post.tags) ? post.tags : []);
    setIsEditing(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await onAddComment(post._id, commentText.trim());
      setCommentText('');
      setShowComposer(false);
    } catch {
      // caller surfaces the error; keep composer open
    }
  };

  return (
    <article id={`post-${post._id}`} className="bg-surface border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn('flex items-center gap-3', clickableHeader && 'cursor-pointer')}
          onClick={clickableHeader ? onHeaderClick : undefined}
        >
          <Avatar src={post.userId?.avatar} name={post.userId?.username} userId={post.userId?._id} size="md" />
          <div>
            <h3 className={cn('font-semibold', clickableHeader && 'hover:underline')}>{post.userId?.username}</h3>
            <p className="text-sm text-text-muted">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showEngagement && !isEditing && (
            <div className="flex items-center gap-4 text-text-muted">
              <button
                className={cn('flex items-center gap-1 transition-colors', isLiked ? 'text-brand' : 'hover:text-text')}
                onClick={() => onLike(post._id)}
              >
                <MotionSpan
                  key={isLiked ? 'liked' : 'unliked'}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="flex"
                >
                  <FiThumbsUp size={20} />
                </MotionSpan>
                <span className="text-sm">{post.likes?.length || 0}</span>
              </button>
              <button
                className={cn('flex items-center gap-1 transition-colors', isSaved ? 'text-brand' : 'hover:text-text')}
                onClick={() => onSave(post._id)}
              >
                <FiBookmark size={20} />
              </button>
              {onShare && (
                <button className="flex items-center gap-1 hover:text-text transition-colors" onClick={() => onShare(post._id)}>
                  <FiSend size={20} />
                </button>
              )}
            </div>
          )}

          {showOwnerActions && isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 text-text-muted hover:text-text transition-colors" aria-label="Post options">
                  <FiMoreVertical size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                  <FiEdit2 size={16} /> Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem destructive onSelect={() => onDelete(post._id)}>
                  <FiTrash2 size={16} /> Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 bg-surface-overlay rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-text"
            rows={4}
          />
          <input
            type="text"
            value={editTags.join(', ')}
            onChange={(e) => setEditTags(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
            placeholder="Tags (comma-separated)"
            className="w-full px-3 py-2 bg-surface-overlay rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-text"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="bg-brand text-brand-fg px-4 py-2 rounded-lg hover:bg-brand-hover transition"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-surface-overlay text-text px-4 py-2 rounded-lg hover:bg-border transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-text mb-4 whitespace-pre-wrap">{post.content}</p>
          {post.image && (
            <div className="relative pt-[56.25%] mb-4">
              <img
                src={getAvatarUrl(post.image)}
                alt="Post content"
                className="absolute top-0 left-0 w-full h-full object-contain rounded-xl bg-black/20"
              />
            </div>
          )}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="brand">#{tag}</Badge>
              ))}
            </div>
          )}
        </>
      )}

      {!isEditing && post.comments?.length > 0 && (
        <div className="mt-4 space-y-4">
          {post.comments.map((comment, index) => (
            <Comment
              key={comment._id || index}
              comment={comment}
              postId={post._id}
              onUpdate={onCommentUpdate}
              allowEdit={allowCommentEdit && comment.userId?._id === currentUserId}
            />
          ))}
        </div>
      )}

      {!isEditing && onAddComment && (
        <div className="mt-4">
          {showComposer ? (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-surface-overlay rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="bg-brand text-brand-fg px-4 py-2 rounded-lg text-sm hover:bg-brand-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowComposer(false);
                  setCommentText('');
                }}
                className="bg-surface-overlay text-text p-2 rounded-lg hover:bg-border transition"
              >
                <FiX size={16} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowComposer(true)}
              className="w-full text-left text-sm text-text-muted hover:text-text py-2"
            >
              Write a comment...
            </button>
          )}
        </div>
      )}
    </article>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string,
    image: PropTypes.string,
    tags: PropTypes.array,
    likes: PropTypes.array,
    savedBy: PropTypes.array,
    comments: PropTypes.array,
    createdAt: PropTypes.string,
    userId: PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string,
      avatar: PropTypes.string,
    }),
  }).isRequired,
  currentUserId: PropTypes.string,
  clickableHeader: PropTypes.bool,
  onHeaderClick: PropTypes.func,
  showEngagement: PropTypes.bool,
  onLike: PropTypes.func,
  onSave: PropTypes.func,
  onShare: PropTypes.func,
  showOwnerActions: PropTypes.bool,
  onSaveEdit: PropTypes.func,
  onDelete: PropTypes.func,
  allowCommentEdit: PropTypes.bool,
  onCommentUpdate: PropTypes.func,
  onAddComment: PropTypes.func,
};

PostCard.defaultProps = {
  clickableHeader: false,
  onHeaderClick: undefined,
  showEngagement: false,
  showOwnerActions: false,
  allowCommentEdit: false,
  onAddComment: undefined,
};
