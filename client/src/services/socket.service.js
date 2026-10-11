import { io } from 'socket.io-client';
import { API_ORIGIN } from '../lib/env';

class SocketService {
    constructor() {
        this.socket = null;
        this.handlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        if (this.socket) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found for socket connection');
            return;
        }

        this.socket = io(API_ORIGIN, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 20000,
            withCredentials: true,
            autoConnect: true
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected successfully');
            this.reconnectAttempts = 0;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.disconnect();
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                setTimeout(() => this.connect(), 1000);
            }
        });

        // Add any other event listeners here
        this.socket.on('newMessage', (data) => {
            this.triggerHandler('newMessage', data);
        });

        this.socket.on('userTyping', (data) => {
            this.triggerHandler('userTyping', data);
        });

        this.socket.on('connectionRequest', (data) => {
            this.triggerHandler('connectionRequest', data);
        });

        this.socket.on('connectionAccepted', (data) => {
            this.triggerHandler('connectionAccepted', data);
        });

        this.socket.on('userOnline', (userId) => {
            this.triggerHandler('userOnline', userId);
        });

        this.socket.on('userOffline', (userId) => {
            this.triggerHandler('userOffline', userId);
        });

        this.socket.on('onlineUsers', (userIds) => {
            this.triggerHandler('onlineUsers', userIds);
        });

        this.socket.on('sessionRequest', (data) => {
            this.triggerHandler('sessionRequest', data);
        });

        this.socket.on('sessionResponse', (data) => {
            this.triggerHandler('sessionResponse', data);
        });

        this.socket.on('profileViewed', (data) => {
            this.triggerHandler('profileViewed', data);
        });
    }

    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event).push(handler);
    }

    off(event, handler) {
        if (!this.handlers.has(event)) return;
        const handlers = this.handlers.get(event);
        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    triggerHandler(event, data) {
        if (!this.handlers.has(event)) return;
        this.handlers.get(event).forEach(handler => handler(data));
    }

    emit(event, data) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit(event, data);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.reconnectAttempts = 0;
        }
    }

    reconnect() {
        this.disconnect();
        this.connect();
    }
}

export default new SocketService(); 