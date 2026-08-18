import { useSocket } from '../contexts/SocketContext';

export function UserStatus({ userId }) {
    const { onlineUsers } = useSocket();
    const isOnline = onlineUsers.has(userId);

    return (
        <span className={`status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
        </span>
    );
} 