import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { MessageCircle } from 'lucide-react';
import ChatArea from '../components/ChatArea';
import MessageSidebar from '../components/MessageSidebar';
import { EmptyState } from '../components/ui/EmptyState';
import { toast } from '../components/ui/Toast';
import { API_URL } from '../lib/env';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { socket: socketContext } = useSocket();
  const [chatId, setChatId] = useState(null);
  const [selectedContact, setSelectedContact] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  // Mobile-only list↔thread navigation; desktop always shows both panes regardless of this.
  const [mobileView, setMobileView] = useState('list');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // The socket connection is owned by SocketProvider for the whole app session.
    // connect() is safe to call again here — it's a no-op if already connected —
    // and acts as a retry in case the very first attempt happened before login
    // was ready. Just don't disconnect() on unmount here: that would kill
    // real-time features app-wide the moment you navigate away from this page.
    if (socketContext) {
      socketContext.connect();
      if (user?._id) {
        socketContext.emit('addUser', user._id);
      }
    }
  }, [isAuthenticated, navigate, user, socketContext]);

  // Handle direct chat navigation from share button
  useEffect(() => {
    if (location.state?.userId) {
      console.log('Initiating chat with user:', location.state);
      initiateChat(location.state.userId, location.state.username);
    }
  }, [location.state]);

  // Fetch pending connection requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/chats/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingRequests(response.data);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    if (user?._id) {
      fetchPendingRequests();
    }
  }, [user]);

  // Handle socket events for connection requests
  useEffect(() => {
    if (socketContext) {
      socketContext.on('connectionRequest', (request) => {
        setPendingRequests(prev => [...prev, request]);
      });

      socketContext.on('connectionAccepted', (chatData) => {
        setConversations(prev => [...prev, chatData]);
      });

      return () => {
        socketContext.off('connectionRequest');
        socketContext.off('connectionAccepted');
      };
    }
  }, [socketContext]);

  // Search users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chats/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.filter(u => u._id !== user._id));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Add debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    // Fetch conversations — the server already populates otherUser for each chat
    const getConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (user?._id) {
      getConversations();
    }
  }, [user]);

  // Add debug log for conversations state
  useEffect(() => {
    console.log('Current conversations state:', conversations);
  }, [conversations]);

  // Add socket event listener for new messages
  useEffect(() => {
    if (socketContext) {
      socketContext.on('newMessage', (message) => {
        // Update conversations to reflect the new message
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv._id === message.chatId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: (conv.unreadCount || 0) + 1
              };
            }
            return conv;
          });
        });

        // If this message belongs to the currently open chat, add it (avoid duplicates
        // since the sender already appends their own message optimistically)
        if (currentChat?._id === message.chatId) {
          setMessages(prev => prev.some(m => m._id === message._id) ? prev : [...prev, message]);
        }
      });

      return () => {
        socketContext.off('newMessage');
      };
    }
  }, [socketContext, currentChat]);

  useEffect(() => {
    // Fetch messages for current chat and join its socket room
    const getMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/chats/${currentChat._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    if (currentChat?._id) {
      getMessages();
      setChatId(currentChat._id);
      if (socketContext) {
        socketContext.emit('join chat', currentChat._id);
      }
    }
  }, [currentChat, socketContext]);

  useEffect(() => {
    if (!socketContext) return;

    const handleTyping = (data) => {
      if (data.chatId === chatId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleStopTyping = (data) => {
      if (data.chatId === chatId) {
        setIsTyping(false);
      }
    };

    socketContext.on('userTyping', handleTyping);
    socketContext.on('userStoppedTyping', handleStopTyping);

    return () => {
      socketContext.off('userTyping', handleTyping);
      socketContext.off('userStoppedTyping', handleStopTyping);
    };
  }, [chatId, socketContext]);

  const handleSendMessage = async (text) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chats/${currentChat._id}/messages`, {
        text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      socketContext.emit('sendMessage', response.data);

      setMessages([...messages, response.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendAttachment = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/chats/${currentChat._id}/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      socketContext.emit('sendMessage', response.data);

      setMessages([...messages, response.data]);
    } catch (error) {
      console.error('Error sending attachment:', error);
    }
  };

  const handleTypingIndicator = () => {
    socketContext.emit('typing', {
      chatId: currentChat._id,
      userId: user._id
    });
  };

  const handleContactSelect = async (contactName) => {
    try {
      console.log('Selecting contact:', contactName);
      console.log('Available conversations:', conversations);
      
      setSelectedContact(contactName);
      
      // Find conversation more reliably
      const conversation = conversations.find(conv => {
        console.log('Checking conversation:', conv);
        console.log('Other user:', conv.otherUser);
        return conv.otherUser?.username === contactName || 
               conv.otherUser?.name === contactName;
      });
      
      console.log('Found conversation:', conversation);
      
      if (!conversation) {
        console.error('No conversation found for contact:', contactName);
        return;
      }

      setCurrentChat(conversation);
      setMobileView('thread');

      const token = localStorage.getItem('token');

      // Mark messages as read
      await axios.put(`${API_URL}/chats/${conversation._id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update unread count in conversations
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error in handleContactSelect:', error);
    }
  };

  const initiateChat = async (userId, username) => {
    try {
      console.log('Initiating chat with:', { userId, username });
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ask the server directly for an existing conversation rather than relying on
      // local `conversations` state, which may not have finished loading yet.
      const chatsResponse = await axios.get(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(chatsResponse.data);

      const existingConv = chatsResponse.data.find(conv =>
        conv.members.some(member => member._id === userId)
      );

      if (existingConv) {
        console.log('Found existing conversation:', existingConv);
        setCurrentChat(existingConv);
        setSelectedContact(existingConv.otherUser.username);
        setMobileView('thread');
        return;
      }

      console.log('Sending connection request with data:', { receiverId: userId });
      // Send connection request
      const response = await axios.post(
        `${API_URL}/chats/request`,
        { receiverId: userId },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Connection request response:', response.data);

      // Emit socket event for real-time notification
      if (socketContext && response.data) {
        socketContext.emit('sendConnectionRequest', {
          receiverId: userId,
          requestData: response.data
        });
      }

      // Show confirmation to sender
      toast.success(`Connection request sent to ${username || 'user'}! Please wait for them to accept.`);
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error initiating chat:', error.response || error);
      let errorMessage = 'Failed to send connection request.';
      
      if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'Server not responding. Please try again later.';
      }
      
      toast.error(errorMessage);
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleConnectionResponse = async (requestId, accept) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/chats/request/${requestId}/respond`,
        { accept },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (accept) {
        // Add new conversation with the welcome message
        const newConversation = response.data;
        
        // Update conversations state with the new conversation
        setConversations(prev => {
          const updatedConversations = [...prev];
          const existingIndex = updatedConversations.findIndex(c => c._id === newConversation._id);
          
          if (existingIndex >= 0) {
            updatedConversations[existingIndex] = newConversation;
          } else {
            updatedConversations.push(newConversation);
          }
          
          return updatedConversations;
        });
        
        // Emit socket event
        if (socketContext) {
          socketContext.emit('connectionRequestAccepted', {
            requestId,
            chatData: newConversation
          });
        }

        // Set current chat — the messages/join-room effect picks this up automatically
        setCurrentChat(newConversation);
        setSelectedContact(newConversation.otherUser.username);
        setMobileView('thread');
      }

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      console.error('Error handling connection response:', error);
    }
  };

  // Debug log for rendering
  console.log('Rendering ChatPage with:', {
    selectedContact,
    currentChat,
    conversations: conversations.length,
    messages: messages.length
  });

  if (!isAuthenticated) {
    return null;
  }

  const showThread = mobileView === 'thread';

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] lg:h-screen bg-bg">
      {/* Message Sidebar */}
      <MessageSidebar
        selectedContact={selectedContact}
        onContactSelect={handleContactSelect}
        conversations={conversations}
        pendingRequests={pendingRequests}
        onAcceptRequest={(requestId) => handleConnectionResponse(requestId, true)}
        onIgnoreRequest={(requestId) => handleConnectionResponse(requestId, false)}
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setIsSearching(value.trim().length > 0);
        }}
        isSearching={isSearching}
        searchResults={searchResults}
        onSelectSearchResult={initiateChat}
        mobileHidden={showThread}
      />

      {/* Main Chat Area */}
      <div className={`${showThread ? 'flex' : 'hidden'} lg:flex flex-1 min-h-0`}>
        {currentChat ? (
          <ChatArea
            contactName={currentChat.otherUser?.username}
            contactImage={currentChat.otherUser?.avatar}
            contactUserId={currentChat.otherUser?._id}
            isTyping={isTyping}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onSendAttachment={handleSendAttachment}
            messages={messages}
            onTyping={handleTypingIndicator}
            onBack={() => setMobileView('list')}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-bg">
            <EmptyState icon={MessageCircle} title="Select a chat" body="Pick a conversation from the list to start messaging." />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
