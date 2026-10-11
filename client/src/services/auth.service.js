import { API_URL } from '../lib/env';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to login');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    signup: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to signup');
            }

            return response.json();
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    googleAuth: async (credential) => {
        try {
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credential })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to sign in with Google');
            }

            return response.json();
        } catch (error) {
            console.error('Google auth error:', error);
            throw error;
        }
    },

    confirmRole: async (role) => {
        try {
            const response = await fetch(`${API_URL}/auth/confirm-role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to set role');
            }

            return response.json();
        } catch (error) {
            console.error('Confirm role error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}; 