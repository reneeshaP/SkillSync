import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket.service';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        // Connect to socket when the provider mounts
        socketService.connect();

        // Handle connection status
        socketService.on('connect', () => {
            setIsConnected(true);
        });

        socketService.on('connect_error', () => {
            setIsConnected(false);
        });

        // Handle user status updates
        socketService.on('onlineUsers', (userIds) => {
            setOnlineUsers(new Set(userIds));
        });

        socketService.on('userOnline', (userId) => {
            setOnlineUsers(prev => new Set(prev).add(userId));
        });

        socketService.on('userOffline', (userId) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        // Cleanup on unmount
        return () => {
            socketService.disconnect();
        };
    }, []);

    const value = {
        isConnected,
        onlineUsers,
        socket: socketService,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}; 