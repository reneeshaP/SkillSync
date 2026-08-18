import { useState } from 'react';
import { FiThumbsUp, FiMessageSquare, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/post.service';

const API_BASE_URL = 'http://localhost:8000';

const Comment = ({ comment, postId, onUpdate, allowEdit }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [editingComment, setEditingComment] = useState(false);
    const [editingReply, setEditingReply] = useState(null);
    const [editContent, setEditContent] = useState('');
    const { user } = useAuth();

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        return avatarPath.startsWith('http') ? avatarPath : `${API_BASE_URL}${avatarPath}`;
    };

    const handleLikeComment = async () => {
        try {
            await postService.likeComment(postId, comment._id);
            onUpdate();
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

    const handleLikeReply = async (replyId) => {
        try {
            await postService.likeReply(postId, comment._id, replyId);
            onUpdate();
        } catch (err) {
            console.error('Error liking reply:', err);
        }
    };

    const handleAddReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await postService.addReply(postId, comment._id, replyText);
            setReplyText('');
            setShowReplyInput(false);
            onUpdate();
        } catch (err) {
            console.error('Error adding reply:', err);
        }
    };

    const handleEditComment = async () => {
        if (editingComment) {
            try {
                await postService.editComment(postId, comment._id, editContent);
                setEditingComment(false);
                onUpdate();
            } catch (err) {
                console.error('Error editing comment:', err);
            }
        } else {
            setEditContent(comment.content);
            setEditingComment(true);
        }
    };

    const handleDeleteComment = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await postService.deleteComment(postId, comment._id);
                onUpdate();
            } catch (err) {
                console.error('Error deleting comment:', err);
            }
        }
    };

    const handleEditReply = async (replyId) => {
        if (editingReply === replyId) {
            try {
                await postService.editReply(postId, comment._id, replyId, editContent);
                setEditingReply(null);
                onUpdate();
            } catch (err) {
                console.error('Error editing reply:', err);
            }
        } else {
            const reply = comment.replies.find(r => r._id === replyId);
            setEditContent(reply.content);
            setEditingReply(replyId);
        }
    };

    const handleDeleteReply = async (replyId) => {
        if (window.confirm('Are you sure you want to delete this reply?')) {
            try {
                await postService.deleteReply(postId, comment._id, replyId);
                onUpdate();
            } catch (err) {
                console.error('Error deleting reply:', err);
            }
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3 bg-[#282c3a] p-3 rounded-lg">
                {comment.userId.avatar ? (
                    <img
                        src={getAvatarUrl(comment.userId.avatar)}
                        alt={comment.userId.username}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {comment.userId.username.substring(0, 2).toUpperCase()}
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{comment.userId.username}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {allowEdit && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleEditComment}
                                        className="p-1 text-gray-400 hover:text-white"
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button
                                        onClick={handleDeleteComment}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {editingComment ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-[#1a1c23] rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={2}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingComment(false)}
                                    className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditComment}
                                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={handleLikeComment}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                        >
                            <FiThumbsUp
                                className={comment.likes.includes(user?._id) ? 'text-purple-500' : ''}
                                size={14}
                            />
                            <span>{comment.likes.length}</span>
                        </button>
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                        >
                            <FiMessageSquare size={14} />
                            <span>Reply</span>
                        </button>
                        {comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-sm text-gray-400 hover:text-white"
                            >
                                {showReplies ? 'Hide replies' : `Show ${comment.replies.length} replies`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Input */}
            {showReplyInput && (
                <form onSubmit={handleAddReply} className="ml-8 flex gap-2">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 bg-[#1a1c23] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reply
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowReplyInput(false);
                            setReplyText('');
                        }}
                        className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition"
                    >
                        <FiX size={16} />
                    </button>
                </form>
            )}

            {/* Replies */}
            {showReplies && comment.replies.length > 0 && (
                <div className="ml-8 space-y-2">
                    {comment.replies.map((reply, index) => (
                        <div key={index} className="flex items-start gap-2 bg-[#1a1c23] p-2 rounded-lg">
                            {reply.userId.avatar ? (
                                <img
                                    src={getAvatarUrl(reply.userId.avatar)}
                                    alt={reply.userId.username}
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                                    {reply.userId.username.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold">{reply.userId.username}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                        {reply.userId._id === user?._id && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditReply(reply._id)}
                                                    className="p-1 text-gray-400 hover:text-white"
                                                >
                                                    <FiEdit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReply(reply._id)}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <FiTrash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {editingReply === reply._id ? (
                                    <div className="mt-1 space-y-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-[#282c3a] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            rows={2}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingReply(null)}
                                                className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEditReply(reply._id)}
                                                className="px-2 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-300 mt-1">{reply.content}</p>
                                )}
                                <button
                                    onClick={() => handleLikeReply(reply._id)}
                                    className="flex items-center gap-1 mt-1 text-xs text-gray-400 hover:text-white"
                                >
                                    <FiThumbsUp
                                        className={reply.likes.includes(user?._id) ? 'text-purple-500' : ''}
                                        size={12}
                                    />
                                    <span>{reply.likes.length}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment; 