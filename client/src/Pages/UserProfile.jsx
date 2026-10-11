import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { profileService } from "../services/profile.service";
import { postService } from "../services/post.service";
import { useAuth } from "../context/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileAbout from "../components/profile/ProfileAbout";
import ProfileSecurity from "../components/profile/ProfileSecurity";
import ProfilePosts from "../components/profile/ProfilePosts";
import ProfileSaved from "../components/profile/ProfileSaved";
import ProfileAvailability from "../components/profile/ProfileAvailability";

const emptyFormData = (data = {}) => ({
  username: data.username || "",
  email: data.email || "",
  location: data.location || "",
  phone: data.phone || "",
  address: data.address || "",
  experience: data.experience || "",
  bio: data.bio || "",
  skills: data.skills || [],
  socialLinks: data.socialLinks || {
    github: "",
    linkedin: "",
    twitter: ""
  }
});

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setUser: setAuthUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'security' ? 'security' : 'profile');

  useEffect(() => {
    if (searchParams.get('tab') === 'security') setActiveTab('security');
  }, [searchParams]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [formData, setFormData] = useState(emptyFormData());
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const isDirty = JSON.stringify(formData) !== JSON.stringify(emptyFormData(user));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setUser(data);
        setFormData(emptyFormData(data));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleCancelEdit = () => {
    setFormData(emptyFormData(user));
    setIsEditing(false);
  };

  const handleAvatarUpload = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append('avatar', file);
    try {
      const updatedUser = await profileService.updateAvatar(formDataObj);
      setUser(prev => ({ ...prev, ...updatedUser }));
      setAuthUser(prev => ({ ...prev, ...updatedUser }));
    } catch (err) {
      console.error("Error updating avatar:", err);
      setError("Failed to update avatar");
    }
  };

  const handleResumeUpload = async (file) => {
    const resumeFormData = new FormData();
    resumeFormData.append('resume', file);
    try {
      const updatedUser = await profileService.uploadResume(resumeFormData);
      setUser(prev => ({ ...prev, resume: updatedUser.resume }));
      setAuthUser(prev => ({ ...prev, resume: updatedUser.resume }));
    } catch (err) {
      console.error("Error uploading resume:", err);
      setError("Failed to upload resume (PDF only, max 5MB)");
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

  const handleSaveEdit = async (postId, content, tags) => {
    if (!content) {
      setError("Post content cannot be empty");
      throw new Error("Post content cannot be empty");
    }
    try {
      await postService.editPost(postId, content, tags);
      const updatedPosts = await postService.getUserPosts();
      setUserPosts(updatedPosts);
      setError("");
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message || "Error updating post");
      throw err;
    }
  };

  const refreshActiveTabPosts = async () => {
    if (activeTab === 'saved') {
      const updatedPosts = await postService.getSavedPosts();
      setSavedPosts(updatedPosts);
    } else if (activeTab === 'myposts') {
      const updatedPosts = await postService.getUserPosts();
      setUserPosts(updatedPosts);
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

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-8 relative">
      <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
        <ProfileHeader user={user} onAvatarUpload={handleAvatarUpload} onResumeUpload={handleResumeUpload} />

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile" activeValue={activeTab}>Profile</TabsTrigger>
              <TabsTrigger value="security" activeValue={activeTab}>Security</TabsTrigger>
              <TabsTrigger value="myposts" activeValue={activeTab}>My Posts</TabsTrigger>
              <TabsTrigger value="saved" activeValue={activeTab}>Saved Posts</TabsTrigger>
              {user.role === 'mentor' && (
                <TabsTrigger value="availability" activeValue={activeTab}>Availability</TabsTrigger>
              )}
            </TabsList>

            <div className="bg-[#1a1c23] rounded-xl p-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                  {error}
                </div>
              )}

              <TabsContent value="profile">
                <ProfileAbout
                  user={user}
                  formData={formData}
                  isEditing={isEditing}
                  onToggleEdit={() => setIsEditing(true)}
                  onChange={handleChange}
                  onSocialLinkChange={handleSocialLinkChange}
                  onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                  onSubmit={handleUpdate}
                  onCancel={handleCancelEdit}
                  isDirty={isDirty}
                />
              </TabsContent>

              <TabsContent value="security">
                <ProfileSecurity
                  passwordData={passwordData}
                  onChange={(field, value) => setPasswordData(prev => ({ ...prev, [field]: value }))}
                  onSubmit={handlePasswordChange}
                  passwordError={passwordError}
                  passwordSuccess={passwordSuccess}
                />
              </TabsContent>

              <TabsContent value="myposts">
                <ProfilePosts
                  posts={userPosts}
                  currentUserId={user._id}
                  onLike={(postId) => handlePostAction(postId, 'like')}
                  onSave={(postId) => handlePostAction(postId, 'save')}
                  onShare={(postId) => handlePostAction(postId, 'share')}
                  onSaveEdit={handleSaveEdit}
                  onDelete={(postId) => handlePostAction(postId, 'delete')}
                  onCommentUpdate={refreshActiveTabPosts}
                />
              </TabsContent>

              <TabsContent value="saved">
                <ProfileSaved
                  posts={savedPosts}
                  currentUserId={user._id}
                  onLike={(postId) => handlePostAction(postId, 'like')}
                  onSave={(postId) => handlePostAction(postId, 'save')}
                  onShare={(postId) => handlePostAction(postId, 'share')}
                  onCommentUpdate={refreshActiveTabPosts}
                />
              </TabsContent>

              {user.role === 'mentor' && (
                <TabsContent value="availability">
                  <ProfileAvailability />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
