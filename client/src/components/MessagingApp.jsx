import { useState } from "react";
import MessageSidebar from "./MessageSidebar";
import ChatArea from "./ChatArea";
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const MessagingApp = () => {
  const [selectedContact, setSelectedContact] = useState("Poule");
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('sendMessage', {
        chatId: selectedContact,
        senderId: user._id,
        text: message,
      });

      // Add message to local state
      setMessages(prev => [...prev, {
        sender: 'me',
        text: message,
        time: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }]);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', {
        chatId: selectedContact,
        userId: user._id
      });
    }
  };

  return (
    <div className="flex h-screen bg-slate-800">
      <MessageSidebar 
        selectedContact={selectedContact}
        onContactSelect={setSelectedContact}
      />
      <ChatArea 
        contactName={selectedContact}
        isTyping={isTyping}
        currentUser={user}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default MessagingApp; 