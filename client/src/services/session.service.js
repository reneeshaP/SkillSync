import api from './api.config';

export const sessionService = {
    async addAvailability(startTime, endTime) {
        const response = await api.post('/api/sessions/availability', { startTime, endTime });
        return response.data;
    },

    async getMyAvailability() {
        const response = await api.get('/api/sessions/availability/mine');
        return response.data;
    },

    async getMentorAvailability(mentorId) {
        const response = await api.get(`/api/sessions/availability/${mentorId}`);
        return response.data;
    },

    async removeAvailability(slotId) {
        const response = await api.delete(`/api/sessions/availability/${slotId}`);
        return response.data;
    },

    async bookSession(slotId, topic) {
        const response = await api.post('/api/sessions/book', { slotId, topic });
        return response.data;
    },

    async getMySessions() {
        const response = await api.get('/api/sessions/mine');
        return response.data;
    },

    async respondToSession(sessionId, accept) {
        const response = await api.put(`/api/sessions/${sessionId}/respond`, { accept });
        return response.data;
    },

    async cancelSession(sessionId) {
        const response = await api.put(`/api/sessions/${sessionId}/cancel`);
        return response.data;
    }
};

export default sessionService;
