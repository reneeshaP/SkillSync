import api from './api.config';

export const dashboardService = {
    async getStats() {
        const response = await api.get('/api/dashboard/stats');
        return response.data;
    }
};

export default dashboardService;
