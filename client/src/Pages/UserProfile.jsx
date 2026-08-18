import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { profileService } from "../services/profile.service";
import { postService } from "../services/post.service";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import AvailabilityManager from "../components/AvailabilityManager";
import StarRating from "../components/StarRating";
import { FiThumbsUp, FiMessageCircle, FiBookmark, FiSend, FiEdit2, FiTrash2, FiGithub, FiLinkedin, FiTwitter, FiLink } from "react-icons/fi";

const API_BASE_URL = 'http://localhost:8000';

const Footer = () => (
  <p className="text-center text-gray-400 text-sm mt-8 pt-4 border-t border-gray-800">
    © 2025 All Rights Reserved
  </p>
);

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setUser: setAuthUser } = useAuth();
  const { socket: socketContext } = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [savedPosts, setSavedPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    location: "",
    phone: "",
    address: "",
    experience: "",
    skills: [],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: ""
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "https://i.pravatar.cc/150?img=5";
    return avatarPath.startsWith('http') ? avatarPath : `${API_BASE_URL}${avatarPath}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setUser(data);
        setFormData({
          username: data.username || "",
          email: data.email || "",
          location: data.location || "",
          phone: data.phone || "",
          address: data.address || "",
          experience: data.experience || "",
          skills: data.skills || [],
          socialLinks: data.socialLinks || {
            github: "",
            linkedin: "",
            twitter: ""
          }
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        setLoading(false);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (activeTab === 'saved') {
        try {
          const posts = await postService.getSavedPosts();
          setSavedPosts(posts);
        } catch (err) {
          console.error("Error fetching saved posts:", err);
        }
      } else if (activeTab === 'myposts') {
        try {
          const posts = await postService.getUserPosts();
          setUserPosts(posts);
        } catch (err) {
          console.error("Error fetching user posts:", err);
        }
      }
    };
    fetchPosts();
  }, [activeTab]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await profileService.updateProfile(formData);
      setUser(updatedUser);
      setAuthUser(prev => ({
        ...prev,
        ...updatedUser
      }));
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError("Failed to update profile");
      console.error("Update error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "skills") {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(",").map(skill => skill.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePostAction = async (postId, action) => {
    try {
      switch (action) {
        case 'like':
          await postService.likePost(postId);
          break;
        case 'save':
          await postService.savePost(postId);
          break;
        case 'share':
          await postService.sharePost(postId);
          break;
        case 'delete':
          await postService.deletePost(postId);
          setUserPosts(userPosts.filter(post => post._id !== postId));
          break;
        case 'edit':
          const post = userPosts.find(p => p._id === postId);
          if (post) {
            setEditingPost({
              ...post,
              tags: Array.isArray(post.tags) ? post.tags : []
            });
          }
          break;
      }
      // Refresh posts if needed
      if (activeTab === 'saved') {
        const updatedPosts = await postService.getSavedPosts();
        setSavedPosts(updatedPosts);
      } else if (activeTab === 'myposts' && action !== 'delete') {
        const updatedPosts = await postService.getUserPosts();
        setUserPosts(updatedPosts);
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(err.message || `Error performing ${action}`);
    }
  };

  const handleEditPost = async (postId) => {
    try {
      // Ensure tags is an array and content is not empty
      const content = editingPost.content.trim();
      const tags = Array.isArray(editingPost.tags) 
        ? editingPost.tags 
        : editingPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      if (!content) {
        setError("Post content cannot be empty");
        return;
      }

      await postService.editPost(postId, content, tags);
      const updatedPosts = await postService.getUserPosts();
      setUserPosts(updatedPosts);
      setEditingPost(null);
      setError("");
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message || "Error updating post");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await postService.deleteComment(postId, commentId);
      const updatedPosts = await postService.getUserPosts();
      setUserPosts(updatedPosts);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleEditComment = async (postId, commentId, content) => {
    try {
      if (!content || !content.trim()) {
        setError("Comment content cannot be empty");
        return;
      }
      await postService.editComment(postId, commentId, content.trim());
      const updatedPosts = await postService.getUserPosts();
      setUserPosts(updatedPosts);
      setError("");
    } catch (err) {
      console.error("Error editing comment:", err);
      setError(err.message || "Error editing comment");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const renderPost = (post, isSaved = false) => (
    <article key={post._id} className="bg-[#282c3a] rounded-xl p-4 mb-4">
      {editingPost && editingPost._id === post._id ? (
        <div className="space-y-4">
          <textarea
            value={editingPost.content}
            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
            className="w-full px-3 py-2 bg-[#1a1c23] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            rows={4}
          />
          <input
            type="text"
            value={editingPost.tags.join(", ")}
            onChange={(e) => setEditingPost({ ...editingPost, tags: e.target.value.split(",").map(tag => tag.trim()) })}
            placeholder="Tags (comma-separated)"
            className="w-full px-3 py-2 bg-[#1a1c23] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleEditPost(post._id)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditingPost(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
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
            {!isSaved && post.userId._id === user._id && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePostAction(post._id, 'edit')}
                  className="text-gray-400 hover:text-white transition"
                >
                  <FiEdit2 size={20} />
                </button>
                <button
                  onClick={() => handlePostAction(post._id, 'delete')}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            )}
          </div>
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
          <div className="flex items-center gap-4 text-gray-400">
            <FiThumbsUp
              className={`cursor-pointer hover:text-white ${
                post.likes.includes(user._id) ? 'text-purple-500' : ''
              }`}
              size={20}
              onClick={() => handlePostAction(post._id, 'like')}
            />
            <FiMessageCircle
              className="cursor-pointer hover:text-white"
              size={20}
            />
            <FiBookmark
              className={`cursor-pointer hover:text-white ${
                post.savedBy?.includes(user._id) ? 'text-purple-500' : ''
              }`}
              size={20}
              onClick={() => handlePostAction(post._id, 'save')}
            />
            <FiSend
              className="cursor-pointer hover:text-white"
              size={20}
              onClick={() => handlePostAction(post._id, 'share')}
            />
          </div>
          {/* Comments section */}
          {post.comments && post.comments.length > 0 && (
            <div className="mt-4 space-y-4">
              <h4 className="font-semibold text-gray-300">Comments</h4>
              {post.comments.map(comment => (
                <div key={comment._id} className="bg-[#1a1c23] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {comment.userId.avatar ? (
                        <img
                          src={getAvatarUrl(comment.userId.avatar)}
                          className="w-6 h-6 rounded-full object-cover"
                          alt={comment.userId.username}
                        />
                      ) : (
                        <div className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                          {comment.userId.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-sm">{comment.userId.username}</span>
                    </div>
                    {!isSaved && comment.userId._id === user._id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditComment(post._id, comment._id, prompt('Edit comment:', comment.content))}
                          className="text-gray-400 hover:text-white transition"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(post._id, comment._id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  );

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-8 relative">
      <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-[#1a1c23] rounded-xl p-6 shadow-lg text-center">
          <div className="relative w-fit mx-auto">
            <img
              src={getAvatarUrl(user.avatar)}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-600"
            />
            <label className="absolute top-0 right-0 bg-purple-600 text-white rounded-full p-1 cursor-pointer hover:bg-purple-700 transition">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('avatar', file);
                    try {
                      const updatedUser = await profileService.updateAvatar(formData);
                      const updatedUserWithFullAvatar = {
                        ...updatedUser,
                        avatar: updatedUser.avatar
                      };
                      setUser(prev => ({ ...prev, ...updatedUserWithFullAvatar }));
                      setAuthUser(prev => ({ ...prev, ...updatedUserWithFullAvatar }));
                    } catch (err) {
                      setError("Failed to update avatar");
                    }
                  }
                }}
              />
              ✏️
            </label>
          </div>
          <h2 className="mt-4 text-xl font-bold">
            {user.username}
          </h2>
          {user.role === 'mentor' && user.reviewCount > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <StarRating rating={user.averageRating} readOnly size={14} />
              <span className="text-sm text-gray-400">{user.averageRating.toFixed(1)} ({user.reviewCount})</span>
            </div>
          )}
          <p className="text-sm text-gray-400">{user.email}</p>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-4 mt-4">
            {user.socialLinks?.github && (
              <a
                href={user.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FiGithub size={20} />
              </a>
            )}
            {user.socialLinks?.linkedin && (
              <a
                href={user.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FiLinkedin size={20} />
              </a>
            )}
            {user.socialLinks?.twitter && (
              <a
                href={user.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <FiTwitter size={20} />
              </a>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                socketContext?.disconnect();
                localStorage.clear();
                setAuthUser(null);
                navigate("/login");
              }}
              className="bg-[#282c3a] hover:bg-[#323744] px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="mb-6 flex space-x-4 border-b border-gray-700">
            <button
              className={`py-2 px-4 ${activeTab === 'profile' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'security' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'myposts' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('myposts')}
            >
              My Posts
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'saved' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Posts
            </button>
            {user.role === 'mentor' && (
              <button
                className={`py-2 px-4 ${activeTab === 'availability' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('availability')}
              >
                Availability
              </button>
            )}
          </div>

          {/* Content */}
          <div className="bg-[#1a1c23] rounded-xl p-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            {activeTab === 'profile' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Profile Details</h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Skills (comma-separated)</label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills.join(", ")}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-4 border-t border-gray-700 pt-4 mt-4">
                      <h3 className="font-medium text-gray-300">Social Links</h3>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          <FiGithub className="inline mr-2" />
                          GitHub Profile
                        </label>
                        <input
                          type="url"
                          name="github"
                          value={formData.socialLinks.github}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                github: e.target.value
                              }
                            }))
                          }
                          placeholder="https://github.com/username"
                          className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          <FiLinkedin className="inline mr-2" />
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.socialLinks.linkedin}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                linkedin: e.target.value
                              }
                            }))
                          }
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          <FiTwitter className="inline mr-2" />
                          Twitter Profile
                        </label>
                        <input
                          type="url"
                          name="twitter"
                          value={formData.socialLinks.twitter}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                twitter: e.target.value
                              }
                            }))
                          }
                          placeholder="https://twitter.com/username"
                          className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-200">Location</h3>
                      <p className="text-sm text-gray-400">{user.location || "Not specified"}</p>
                      <p className="text-sm text-gray-400">{user.address || "No address provided"}</p>
                      <p className="text-sm text-gray-400">{user.phone || "No phone provided"}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-200">
                        {user.role === "mentee" ? "Skills I Want to Learn" : "Skills I Offer"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(user.skills || []).map((skill, i) => (
                          <span
                            key={i}
                            className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-200">Experience</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {user.experience || "Not specified"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : activeTab === 'security' ? (
              <div className="max-w-md mx-auto bg-[#282c3a] rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                {passwordError && (
                  <div className="mb-4 text-red-500 text-sm">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="mb-4 text-green-500 text-sm">{passwordSuccess}</div>
                )}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#1a1c23] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#1a1c23] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#1a1c23] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            ) : activeTab === 'myposts' ? (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold mb-6">My Posts</h1>
                {userPosts.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">You haven't created any posts yet</p>
                ) : (
                  userPosts.map(post => renderPost(post))
                )}
              </div>
            ) : activeTab === 'availability' ? (
              <AvailabilityManager />
            ) : (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold mb-6">Saved Posts</h1>
                {savedPosts.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No saved posts yet</p>
                ) : (
                  savedPosts.map(post => renderPost(post, true))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
