import { useState } from 'react';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { postService } from '../services/post.service';
import Comment from './Comment';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

export default function ManagePost({ post, onUpdate, showComments = true }) {
    const [editingPost, setEditingPost] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [editTags, setEditTags] = useState(post.tags);
    const [showMenu, setShowMenu] = useState(false);
    const { user } = useAuth();

    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) return null;
        return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
    };

    const handleEditPost = async () => {
        try {
            await postService.editPost(post._id, editContent, editTags);
            setEditingPost(false);
            onUpdate();
        } catch (err) {
            console.error('Error updating post:', err);
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await postService.deletePost(post._id);
                onUpdate();
            } catch (err) {
                console.error('Error deleting post:', err);
            }
        }
    };

    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        setEditTags(tags);
    };

    return (
        <article className="bg-[#1a1c23] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {post.userId.avatar ? (
                        <img
                            src={getAvatarUrl(post.userId.avatar)}
                            alt={post.userId.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center font-semibold">
                            {post.userId.username.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold">{post.userId.username}</h3>
                        <p className="text-sm text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                {post.userId._id === user?._id && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            <FiMoreVertical size={20} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#282c3a] rounded-lg shadow-lg py-1 z-10">
                                <button
                                    onClick={() => {
                                        setEditingPost(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-[#1a1c23] flex items-center gap-2"
                                >
                                    <FiEdit2 size={16} />
                                    Edit Post
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeletePost();
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#1a1c23] flex items-center gap-2"
                                >
                                    <FiTrash2 size={16} />
                                    Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {editingPost ? (
                <div className="space-y-3">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-[#282c3a] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={4}
                    />
                    <input
                        type="text"
                        value={editTags.join(', ')}
                        onChange={handleTagsChange}
                        placeholder="Tags (comma-separated)"
                        className="w-full bg-[#282c3a] rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setEditingPost(false)}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEditPost}
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-gray-200 mb-4">{post.content}</p>
                    {post.image && (
                        <div className="relative pt-[56.25%] mb-4">
                            <img
                                src={getAvatarUrl(post.image)}
                                alt="Post content"
                                className="absolute top-0 left-0 w-full h-full object-contain rounded-xl bg-black/20"
                            />
                        </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 space-y-4">
                    {post.comments.map((comment, index) => (
                        <Comment
                            key={index}
                            comment={comment}
                            postId={post._id}
                            onUpdate={onUpdate}
                            allowEdit={comment.userId._id === user?._id}
                        />
                    ))}
                </div>
            )}
        </article>
    );
} 