import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiBell } from 'react-icons/fi';
import notificationService from '../services/notification.service';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ dropUp }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Subscribe to notifications
        const unsubscribe = notificationService.subscribe(notifications => {
            setNotifications(notifications);
            setUnreadCount(notifications.filter(n => !n.read).length);
        });

        // Handle clicks outside of the dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup
        return () => {
            unsubscribe();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (notification) => {
        notificationService.markAsRead(notification.id);
        setIsOpen(false);

        // Navigate based on notification type
        switch (notification.type) {
            case 'NEW_MESSAGE':
            case 'CONNECTION_REQUEST':
            case 'CONNECTION_ACCEPTED':
                navigate('/chat');
                break;
            case 'POST_LIKE':
            case 'POST_COMMENT':
                navigate('/feed');
                break;
            case 'SESSION_REQUEST':
            case 'SESSION_CONFIRMED':
            case 'SESSION_DECLINED':
                navigate('/sessions');
                break;
            case 'PROFILE_VIEW':
                if (notification.data.viewerId) {
                    navigate(`/profile/${notification.data.viewerId}`);
                }
                break;
            case 'MENTOR_AVAILABLE':
                navigate('/people');
                break;
            default:
                break;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than a minute
        if (diff < 60000) {
            return 'Just now';
        }
        // Less than an hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        // Less than a week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
        // Otherwise return the date
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FiBell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute ${dropUp ? 'bottom-full mb-2 left-0' : 'right-0 mt-2'} w-80 bg-[#1a1c23] rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto`}>
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={() => notificationService.markAllAsRead()}
                                className="text-sm text-purple-500 hover:text-purple-400"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="divide-y divide-gray-700">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 cursor-pointer transition-colors ${
                                        notification.read
                                            ? 'bg-[#1a1c23] hover:bg-[#282c3a]'
                                            : 'bg-[#282c3a] hover:bg-[#323744]'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-white">
                                                {notification.data.senderName && (
                                                    <span className="font-semibold">
                                                        {notification.data.senderName}{' '}
                                                    </span>
                                                )}
                                                {notification.type === 'NEW_MESSAGE' && 'sent you a message'}
                                                {notification.type === 'CONNECTION_REQUEST' && 'wants to connect'}
                                                {notification.type === 'CONNECTION_ACCEPTED' && 'accepted your connection request'}
                                                {notification.type === 'POST_LIKE' && 'liked your post'}
                                                {notification.type === 'POST_COMMENT' && 'commented on your post'}
                                                {notification.type === 'SESSION_REQUEST' && 'requested a session with you'}
                                                {notification.type === 'SESSION_CONFIRMED' && 'confirmed your session request'}
                                                {notification.type === 'SESSION_DECLINED' && 'declined your session request'}
                                                {notification.type === 'PROFILE_VIEW' && 'viewed your profile'}
                                                {notification.type === 'MENTOR_AVAILABLE' && 'is available right now'}
                                            </p>
                                            {notification.data.message && (
                                                <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                                                    {notification.data.message}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                {formatTime(notification.data.timestamp)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

NotificationBell.propTypes = {
    dropUp: PropTypes.bool,
};

export default NotificationBell;