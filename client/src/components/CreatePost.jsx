import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/post.service';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    content: '',
    tags: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate content
      if (!formData.content.trim()) {
        throw new Error('Post content is required');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('content', formData.content.trim());
      
      // Handle tags
      const tags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];
      formDataToSend.append('tags', JSON.stringify(tags));

      // Add image if exists
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await postService.createPost(formDataToSend);
      navigate('/'); // Redirect to homepage after successful post
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <div className="max-w-2xl mx-auto bg-[#1a1c23] rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. webdev, react, javascript"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 bg-[#282c3a] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-[#282c3a] rounded-lg hover:bg-[#323744] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 