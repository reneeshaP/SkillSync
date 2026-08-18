import api from './api.config';

export const reviewService = {
    async submitReview(mentorId, rating, comment, sessionId) {
        const response = await api.post('/api/reviews', { mentorId, rating, comment, sessionId });
        return response.data;
    },

    async getMentorReviews(mentorId) {
        const response = await api.get(`/api/reviews/mentor/${mentorId}`);
        return response.data;
    },

    async getMyReview(mentorId) {
        const response = await api.get(`/api/reviews/mine/${mentorId}`);
        return response.data;
    },

    async deleteReview(reviewId) {
        const response = await api.delete(`/api/reviews/${reviewId}`);
        return response.data;
    }
};

export default reviewService;
