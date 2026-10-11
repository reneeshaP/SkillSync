import api from './api.config';

export const connectionService = {
    sendRequest: async (receiverId) => {
        const response = await api.post('/api/chats/request', { receiverId });
        return response.data;
    }
};
