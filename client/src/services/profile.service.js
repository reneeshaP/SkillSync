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