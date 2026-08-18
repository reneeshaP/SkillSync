import {
  FiBookmark,
  FiMessageCircle,
  FiPlus,
  FiSearch,
  FiSend,
  FiUsers,
  FiThumbsUp,
  FiX
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "../services/post.service";
import api from "../services/api.config";
import { useAuth } from "../context/AuthContext";
import Comment from '../components/Comment';
import NotificationBell from '../components/NotificationBell';
import MentorRecommendations from '../components/MentorRecommendations';
import DashboardStats from '../components/DashboardStats';

const API_URL = 'http://localhost:8000';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [peopleResults, setPeopleResults] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postService.getPosts();
        setPosts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts");
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setPeopleResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get(`/api/chats/users/search?q=${encodeURIComponent(searchQuery)}`);
        setPeopleResults(response.data);
      } catch {
        setPeopleResults([]);
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

  const handlePostAction = async (postId, action, data = null) => {
    try {
      let updatedPost;
      switch (action) {
        case 'like':
          updatedPost = await postService.likePost(postId);
          break;
        case 'save':
          updatedPost = await postService.savePost(postId);
          break;
        case 'share':
          const post = posts.find(p => p._id === postId);
          if (post) {
            navigate('/chat', { state: { userId: post.userId._id } });
          }
          return;
        case 'comment':
          if (data) {
            updatedPost = await postService.addComment(postId, data);
            setCommentText("");
            setActiveCommentPost(null);
          }
          break;
      }
      // Refresh posts to show updated state
      const updatedPosts = await postService.getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#0f1117] border-b border-gray-800 p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img
            src="/logo.png"
            alt="SkillSync Logo"
            className="w-10 h-10 object-contain"
          />

          <div className="flex-1 max-w-xl mx-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SkillSync"
              className="w-full bg-[#1a1c23] rounded-full py-2 px-4 pl-10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

            {searchQuery.trim() && peopleResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-[#1a1c23] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <p className="text-xs text-gray-500 px-3 pt-2">People</p>
                {peopleResults.map((person) => (
                  <div
                    key={person._id}
                    onClick={() => {
                      navigate('/chat', { state: { userId: person._id, username: person.username } });
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#282c3a] cursor-pointer"
                  >
                    {person.avatar ? (
                      <img src={getAvatarUrl(person.avatar)} className="w-8 h-8 rounded-full object-cover" alt={person.username} />
                    ) : (
                      <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {person.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white">{person.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            <NotificationBell />
            <FiMessageCircle 
              className="text-gray-400 hover:text-white cursor-pointer" 
              size={24} 
              onClick={() => navigate('/chat')}
            />
            <FiUsers
              className="text-gray-400 hover:text-white cursor-pointer"
              size={24}
              onClick={() => navigate('/people')}
            />
            <div 
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
              onClick={() => navigate('/create-post')}
            >
              <FiPlus className="text-[#0f1117]" size={20} />
            </div>
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  className="w-8 h-8 rounded-full cursor-pointer object-cover"
                  onClick={() => navigate('/userprofile')}
                  alt="Profile"
                />
              ) : (
                <div 
                  className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer text-sm font-semibold"
                  onClick={() => navigate('/userprofile')}
                >
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-24 pb-20 px-20">
        <DashboardStats />
        <MentorRecommendations />
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 p-4">No posts yet. Be the first to share!</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-400 p-4">No posts match "{searchQuery}"</div>
        ) : (
          filteredPosts.map(post => (
            <article key={post._id} className="bg-[#1a1c23] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {post.userId.avatar ? (
                    <img
                      src={getAvatarUrl(post.userId.avatar)}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={post.userId.username}
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
                <div className="flex items-center gap-4 text-gray-400">
                  <button 
                    className={`flex items-center gap-1 transition-colors ${
                      post.likes.includes(user?._id) ? 'text-purple-500' : 'hover:text-white'
                    }`}
                    onClick={() => handlePostAction(post._id, 'like')}
                  >
                    <FiThumbsUp size={20} />
                    <span className="text-sm">{post.likes.length}</span>
                  </button>
                  <button 
                    className={`flex items-center gap-1 transition-colors ${
                      post.savedBy?.includes(user?._id) ? 'text-purple-500' : 'hover:text-white'
                    }`}
                    onClick={() => handlePostAction(post._id, 'save')}
                  >
                    <FiBookmark size={20} />
                  </button>
                  <button 
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => handlePostAction(post._id, 'share')}
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </div>
              <p className="text-gray-200 mb-4">{post.content}</p>
              {post.image && (
                <div className="relative pt-[56.25%]">
                  <img
                    src={getAvatarUrl(post.image)}
                    alt="Post content"
                    className="absolute top-0 left-0 w-full h-full object-contain rounded-xl bg-black/20"
                  />
                </div>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
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
              
              {/* Comments Section */}
              <div className="mt-4 space-y-4">
                {post.comments.map((comment, index) => (
                  <Comment
                    key={index}
                    comment={comment}
                    postId={post._id}
                    onUpdate={() => handlePostAction(post._id)}
                  />
                ))}

                {/* Comment Input */}
                {activeCommentPost === post._id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePostAction(post._id, 'comment', commentText);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-[#282c3a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCommentPost(null);
                        setCommentText('');
                      }}
                      className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      <FiX size={16} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveCommentPost(post._id)}
                    className="w-full text-left text-sm text-gray-400 hover:text-white py-2"
                  >
                    Write a comment...
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
}
