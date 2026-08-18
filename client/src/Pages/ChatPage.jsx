import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { FiMessageCircle } from 'react-icons/fi';
import ChatArea from '../components/ChatArea';
import MessageSidebar from '../components/MessageSidebar';
import ConnectionRequestPopup from '../components/ConnectionRequestPopup';

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
        const response = await axios.get('http://localhost:8000/api/chats/requests', {
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
      const response = await axios.get(`http://localhost:8000/api/chats/users/search?q=${query}`, {
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
        const response = await axios.get('http://localhost:8000/api/chats', {
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
        const response = await axios.get(`http://localhost:8000/api/chats/${currentChat._id}/messages`, {
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
      const response = await axios.post(`http://localhost:8000/api/chats/${currentChat._id}/messages`, {
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

      const response = await axios.post(`http://localhost:8000/api/chats/${currentChat._id}/messages`, formData, {
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

      const token = localStorage.getItem('token');

      // Mark messages as read
      await axios.put(`http://localhost:8000/api/chats/${conversation._id}/read`, {}, {
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
      const chatsResponse = await axios.get('http://localhost:8000/api/chats', {
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
        return;
      }

      console.log('Sending connection request with data:', { receiverId: userId });
      // Send connection request
      const response = await axios.post(
        'http://localhost:8000/api/chats/request', 
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
      alert(`Connection request sent to ${username || 'user'}! Please wait for them to accept.`);
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
      
      alert(errorMessage);
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleConnectionResponse = async (requestId, accept) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:8000/api/chats/request/${requestId}/respond`,
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

  return (
    <div className="flex h-screen bg-[#0f1117]">
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
      />

      {/* Search Results Dropdown */}
      {isSearching && searchResults.length > 0 && (
        <div className="absolute left-80 top-0 w-64 bg-[#1a1c23] rounded-lg shadow-lg mt-2 z-50">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="p-3 hover:bg-[#282c3a] cursor-pointer"
              onClick={() => initiateChat(user._id, user.username)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || "default-avatar.png"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white">{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Chat Area */}
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
          currentUserId={user._id}
          onTyping={handleTypingIndicator}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#1a1c23]">
          <div className="text-center">
            <FiMessageCircle className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
