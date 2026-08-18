import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { UserStatus } from './UserStatus';
import { FiShare2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export function Post({ post: initialPost }) {
    const [post, setPost] = useState(initialPost);
    const { socket } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for like updates
        const handlePostLike = (data) => {
            if (data.postId === post._id) {
                setPost(prev => ({
                    ...prev,
                    likes: data.likes
                }));
            }
        };

        // Listen for new comments
        const handleNewComment = (data) => {
            if (data.postId === post._id) {
                setPost(prev => ({
                    ...prev,
                    comments: [...prev.comments, data.comment]
                }));
            }
        };

        socket.on('postLiked', handlePostLike);
        socket.on('newComment', handleNewComment);

        return () => {
            socket.off('postLiked', handlePostLike);
            socket.off('newComment', handleNewComment);
        };
    }, [post._id, socket]);

    const handleShareClick = () => {
        // Navigate to chat page with the user's ID
        navigate('/chat', { 
            state: { 
                userId: post.userId._id,
                username: post.userId.username 
            }
        });
    };

    return (
        <div className="post">
            <div className="post-header">
                <h3>{post.title}</h3>
                <UserStatus userId={post.userId} />
            </div>
            <div className="post-content">
                {post.content}
            </div>
            <div className="post-footer">
                <span>{post.likes.length} likes</span>
                <span>{post.comments.length} comments</span>
            </div>
            <div className="flex items-center gap-4 mt-4">
                <button
                    onClick={handleShareClick}
                    className="flex items-center gap-2 text-slate-400 hover:text-purple-500 transition-colors"
                >
                    <FiShare2 className="w-5 h-5" />
                    Share
                </button>
            </div>
        </div>
    );
} 