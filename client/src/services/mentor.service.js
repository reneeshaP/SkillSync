import api from './api.config';

export const mentorService = {
    async getRecommendations() {
        const response = await api.get('/api/mentors/recommend');
        return response.data;
    }
};
