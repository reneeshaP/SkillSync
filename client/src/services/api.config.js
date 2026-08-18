import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific error cases
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear local storage and redirect to login
                    localStorage.clear();
                    window.location.href = '/login';
                    break;
                case 403:
                    // Forbidden
                    console.error('Access forbidden');
                    break;
                case 500:
                    // Server error
                    console.error('Server error');
                    break;
                default:
                    console.error('API Error:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default api; 