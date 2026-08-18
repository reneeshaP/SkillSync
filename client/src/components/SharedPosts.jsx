import { useState, useEffect } from 'react';
import { postService } from '../services/post.service';
import ManagePost from './ManagePost';
import { useAuth } from '../context/AuthContext';

export default function SharedPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchSharedPosts();
    }, []);

    const fetchSharedPosts = async () => {
        try {
            const data = await postService.getSharedPosts();
            setPosts(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching shared posts:', err);
            setError('Failed to load shared posts');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Shared Posts</h2>
            {posts.length === 0 ? (
                <p className="text-gray-400 text-center">No shared posts yet.</p>
            ) : (
                posts.map(post => (
                    <ManagePost
                        key={post._id}
                        post={post}
                        onUpdate={fetchSharedPosts}
                    />
                ))
            )}
        </div>
    );
} 