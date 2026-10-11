import api from './api.config';

export const postService = {
    async createPost(formData) {
        try {
            // Validate required fields
            const content = formData.get('content');
            if (!content || !content.trim()) {
                throw new Error('Post content is required');
            }

            // Parse tags if they exist
            const tagsString = formData.get('tags');
            if (tagsString) {
                try {
                    const tags = JSON.parse(tagsString);
                    if (!Array.isArray(tags)) {
                        throw new Error('Tags must be an array');
                    }
                } catch {
                    throw new Error('Invalid tags format');
                }
            }

            const response = await api.post('/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Create post error:', error);
            throw error;
        }
    },

    async getPosts() {
        try {
            const response = await api.get('/api/posts');
            return response.data;
        } catch (error) {
            console.error('Get posts error:', error);
            throw error;
        }
    },

    async getPost(id) {
        try {
            const response = await api.get(`/api/posts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get post error:', error);
            throw error;
        }
    },

    async likePost(id) {
        try {
            const response = await api.post(`/api/posts/${id}/like`);
            return response.data;
        } catch (error) {
            console.error('Like post error:', error);
            throw error;
        }
    },

    async addComment(id, content) {
        try {
            const response = await api.post(`/api/posts/${id}/comments`, { content });
            return response.data;
        } catch (error) {
            console.error('Add comment error:', error);
            throw error;
        }
    },

    async editPost(id, content, tags) {
        try {
            const response = await api.put(`/api/posts/${id}`, { content, tags });
            return response.data;
        } catch (error) {
            console.error('Edit post error:', error);
            throw error;
        }
    },

    async updatePost(id, postData) {
        try {
            const response = await api.put(`/api/posts/${id}`, postData);
            return response.data;
        } catch (error) {
            console.error('Update post error:', error);
            throw error;
        }
    },

    async deletePost(id) {
        try {
            const response = await api.delete(`/api/posts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete post error:', error);
            throw error;
        }
    },

    async commentOnPost(postId, content) {
        try {
            const response = await api.post(`/api/posts/${postId}/comments`, { content });
            return response.data;
        } catch (error) {
            console.error('Comment on post error:', error);
            throw error;
        }
    },

    async savePost(postId) {
        try {
            const response = await api.post(`/api/posts/${postId}/save`);
            return response.data;
        } catch (error) {
            console.error('Save post error:', error);
            throw error;
        }
    },

    async sharePost(postId) {
        try {
            const response = await api.post(`/api/posts/${postId}/share`);
            return response.data;
        } catch (error) {
            console.error('Share post error:', error);
            throw error;
        }
    },

    async getSavedPosts() {
        try {
            const response = await api.get('/api/posts/saved');
            return response.data;
        } catch (error) {
            console.error('Get saved posts error:', error);
            throw error;
        }
    },

    async addReply(postId, commentId, content) {
        try {
            const response = await api.post(`/api/posts/${postId}/comments/${commentId}/replies`, { content });
            return response.data;
        } catch (error) {
            console.error('Add reply error:', error);
            throw error;
        }
    },

    async likeComment(postId, commentId) {
        try {
            const response = await api.post(`/api/posts/${postId}/comments/${commentId}/like`);
            return response.data;
        } catch (error) {
            console.error('Like comment error:', error);
            throw error;
        }
    },

    async likeReply(postId, commentId, replyId) {
        try {
            const response = await api.post(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`);
            return response.data;
        } catch (error) {
            console.error('Like reply error:', error);
            throw error;
        }
    },

    async editComment(postId, commentId, content) {
        try {
            const response = await api.put(`/api/posts/${postId}/comments/${commentId}`, { content });
            return response.data;
        } catch (error) {
            console.error('Edit comment error:', error);
            throw error;
        }
    },

    async deleteComment(postId, commentId) {
        try {
            const response = await api.delete(`/api/posts/${postId}/comments/${commentId}`);
            return response.data;
        } catch (error) {
            console.error('Delete comment error:', error);
            throw error;
        }
    },

    async editReply(postId, commentId, replyId, content) {
        try {
            const response = await api.put(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`, { content });
            return response.data;
        } catch (error) {
            console.error('Edit reply error:', error);
            throw error;
        }
    },

    async deleteReply(postId, commentId, replyId) {
        try {
            const response = await api.delete(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`);
            return response.data;
        } catch (error) {
            console.error('Delete reply error:', error);
            throw error;
        }
    },

    async getUserPosts() {
        try {
            const response = await api.get('/api/posts/user');
            return response.data;
        } catch (error) {
            console.error('Get user posts error:', error);
            throw error;
        }
    }
}; 