import socketService from './socket.service';

class NotificationService {
    constructor() {
        this.notifications = [];
        this.handlers = new Set();
        this.notifiedAvailableMentors = new Set();
        this.setupSocketListeners();
    }

    // Fired when a mentee's matched-mentor list loads and a mentor currently has
    // an open slot. Deduped per mentor for the lifetime of this browser session
    // so it doesn't re-fire every time the mentee revisits Home/People.
    notifyMentorAvailable(mentor) {
        if (this.notifiedAvailableMentors.has(mentor._id)) return;
        this.notifiedAvailableMentors.add(mentor._id);
        this.addNotification({
            type: 'MENTOR_AVAILABLE',
            data: {
                senderName: mentor.username,
                mentorId: mentor._id,
                timestamp: Date.now()
            }
        });
    }

    getCurrentUserId() {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser)._id : null;
        } catch {
            return null;
        }
    }

    setupSocketListeners() {
        socketService.on('connectionRequest', (requestData) => {
            const myId = this.getCurrentUserId();
            if (requestData?.sender?._id === myId) return; // don't notify yourself

            this.addNotification({
                type: 'CONNECTION_REQUEST',
                data: {
                    senderName: requestData?.sender?.username,
                    timestamp: requestData?.createdAt || Date.now()
                }
            });
        });

        socketService.on('connectionAccepted', (chatData) => {
            const myId = this.getCurrentUserId();
            if (chatData?.otherUser?._id === myId) return; // don't notify yourself

            this.addNotification({
                type: 'CONNECTION_ACCEPTED',
                data: {
                    accepterName: chatData?.otherUser?.username,
                    timestamp: Date.now()
                }
            });
        });

        socketService.on('newMessage', (messageData) => {
            const myId = this.getCurrentUserId();
            if (messageData?.sender?._id === myId) return; // don't notify yourself of your own message

            this.addNotification({
                type: 'NEW_MESSAGE',
                data: {
                    chatId: messageData?.chatId,
                    senderName: messageData?.sender?.username,
                    message: messageData?.text,
                    timestamp: messageData?.createdAt || Date.now()
                }
            });
        });

        socketService.on('sessionRequest', (sessionData) => {
            this.addNotification({
                type: 'SESSION_REQUEST',
                data: {
                    senderName: sessionData?.mentee?.username,
                    timestamp: sessionData?.createdAt || Date.now()
                }
            });
        });

        socketService.on('sessionResponse', (sessionData) => {
            this.addNotification({
                type: sessionData?.status === 'confirmed' ? 'SESSION_CONFIRMED' : 'SESSION_DECLINED',
                data: {
                    senderName: sessionData?.mentor?.username,
                    timestamp: Date.now()
                }
            });
        });

        socketService.on('profileViewed', (viewData) => {
            this.addNotification({
                type: 'PROFILE_VIEW',
                data: {
                    viewerId: viewData?.viewerId,
                    senderName: viewData?.viewerName,
                    timestamp: Date.now()
                }
            });
        });
    }

    addNotification(notification) {
        // Add the notification to the list
        this.notifications.unshift({
            ...notification,
            id: Date.now(),
            read: false
        });

        // Keep only the last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        // Notify all handlers
        this.notifyHandlers();

        // Show browser notification if supported
        this.showBrowserNotification(notification);
    }

    showBrowserNotification(notification) {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            this.createBrowserNotification(notification);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.createBrowserNotification(notification);
                }
            });
        }
    }

    createBrowserNotification(notification) {
        let title = '';
        let body = '';

        switch (notification.type) {
            case 'NEW_MESSAGE':
                title = `New Message from ${notification.data.senderName}`;
                body = notification.data.message;
                break;
            case 'CONNECTION_REQUEST':
                title = 'New Connection Request';
                body = `${notification.data.senderName} wants to connect with you`;
                break;
            case 'CONNECTION_ACCEPTED':
                title = 'Connection Request Accepted';
                body = `${notification.data.accepterName} accepted your connection request`;
                break;
            case 'POST_LIKE':
                title = 'New Like';
                body = `${notification.data.senderName} liked your post`;
                break;
            case 'POST_COMMENT':
                title = 'New Comment';
                body = `${notification.data.senderName} commented on your post`;
                break;
            case 'SESSION_REQUEST':
                title = 'New Session Request';
                body = `${notification.data.senderName} requested a session with you`;
                break;
            case 'SESSION_CONFIRMED':
                title = 'Session Confirmed';
                body = `${notification.data.senderName} confirmed your session request`;
                break;
            case 'SESSION_DECLINED':
                title = 'Session Declined';
                body = `${notification.data.senderName} declined your session request`;
                break;
            case 'PROFILE_VIEW':
                title = 'Profile Viewed';
                body = `${notification.data.senderName} viewed your profile`;
                break;
            case 'MENTOR_AVAILABLE':
                title = 'Mentor Available';
                body = `${notification.data.senderName} is available right now`;
                break;
            default:
                title = 'New Notification';
                body = 'You have a new notification';
        }

        new Notification(title, {
            body,
            icon: '/logo.png', // Add your app logo path here
            badge: '/logo.png',
            timestamp: notification.data.timestamp
        });
    }

    subscribe(handler) {
        this.handlers.add(handler);
        // Immediately notify the new handler of existing notifications
        handler(this.notifications);
        return () => this.handlers.delete(handler);
    }

    notifyHandlers() {
        this.handlers.forEach(handler => handler(this.notifications));
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.notifyHandlers();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.notifyHandlers();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    clearAll() {
        this.notifications = [];
        this.notifyHandlers();
    }
}

export default new NotificationService(); 