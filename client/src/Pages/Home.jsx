import { FiMessageCircle, FiZap } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { postService } from "../services/post.service";
import api from "../services/api.config";
import { useAuth } from "../context/AuthContext";
import MentorRecommendations from '../components/MentorRecommendations';
import DashboardStats from '../components/DashboardStats';
import PostCard from '../components/PostCard';
import PostCardSkeleton from '../components/PostCardSkeleton';
import FeedSearch from '../components/FeedSearch';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Container } from '../components/layout/Container';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [peopleResults, setPeopleResults] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await postService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setPeopleResults([]);
      return;
    }
    setPeopleLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get(`/api/chats/users/search?q=${encodeURIComponent(searchQuery)}`);
        setPeopleResults(response.data);
      } catch {
        setPeopleResults([]);
      } finally {
        setPeopleLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredPosts = searchQuery.trim()
    ? posts.filter(post =>
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  const handlePostAction = async (postId, action) => {
    try {
      if (action === 'like') {
        await postService.likePost(postId);
      } else if (action === 'save') {
        await postService.savePost(postId);
      } else if (action === 'share') {
        const post = posts.find(p => p._id === postId);
        if (post) {
          navigate('/chat', { state: { userId: post.userId._id } });
        }
        return;
      }
      // Refresh posts to show updated state
      const updatedPosts = await postService.getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      await postService.addComment(postId, text);
      const updatedPosts = await postService.getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const handleSelectPerson = (person) => {
    navigate(`/profile/${person._id}`);
    setSearchQuery('');
  };

  const handleSelectPost = (postId) => {
    setSearchQuery('');
    requestAnimationFrame(() => {
      document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <Container className="max-w-6xl pt-6 pb-10">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
          <div className="min-w-0">
            <div className="mb-6">
              <FeedSearch
                query={searchQuery}
                onQueryChange={setSearchQuery}
                people={peopleResults}
                peopleLoading={peopleLoading}
                posts={posts}
                onSelectPerson={handleSelectPerson}
                onSelectPost={handleSelectPost}
              />
            </div>

            {/* Mobile-only: stats strip + compact matches link, above the feed */}
            <div className="lg:hidden mb-4 space-y-4">
              <DashboardStats />
              <Link
                to="/people"
                className="flex items-center justify-between bg-[#1a1c23] rounded-xl p-4 hover:bg-[#20222b] transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <FiZap className="text-purple-500" size={18} />
                  See your matches
                </span>
                <span className="text-sm text-purple-400">View all</span>
              </Link>
            </div>

            {loading ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : error ? (
              <ErrorState title="Couldn't load your feed" body={error} onRetry={fetchPosts} />
            ) : posts.length === 0 ? (
              <EmptyState
                icon={FiMessageCircle}
                title="No posts yet"
                body="Be the first to share something with the community."
                actionLabel="Create a post"
                onAction={() => navigate('/create-post')}
              />
            ) : filteredPosts.length === 0 ? (
              <div className="text-center text-gray-400 p-4">No posts match "{searchQuery}"</div>
            ) : (
              filteredPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={user?._id}
                  clickableHeader
                  onHeaderClick={() => navigate(`/profile/${post.userId._id}`)}
                  showEngagement
                  onLike={(postId) => handlePostAction(postId, 'like')}
                  onSave={(postId) => handlePostAction(postId, 'save')}
                  onShare={(postId) => handlePostAction(postId, 'share')}
                  onCommentUpdate={() => handlePostAction(post._id)}
                  onAddComment={handleAddComment}
                />
              ))
            )}
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-20 space-y-4">
            <DashboardStats />
            <MentorRecommendations />
          </aside>
        </div>
      </Container>
    </div>
  );
}
