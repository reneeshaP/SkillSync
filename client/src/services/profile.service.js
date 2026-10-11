import axios from '../utils/axios';

export const profileService = {
    getProfile: async () => {
        const response = await axios.get('/api/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await axios.put('/api/profile', profileData);
        return response.data;
    },

    completeOnboarding: async (data) => {
        const response = await axios.put('/api/profile/complete-onboarding', data);
        return response.data;
    },

    uploadResume: async (formData) => {
        const response = await axios.put('/api/profile/resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getUserProfile: async (id) => {
        const response = await axios.get(`/api/profile/${id}`);
        return response.data;
    },

    updateAvatar: async (formData) => {
        const response = await axios.put('/api/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await axios.put('/api/profile/change-password', passwordData);
        return response.data;
    }
}; 