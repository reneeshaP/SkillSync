import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Video, X } from "lucide-react";
import ChatMessages from "./ChatMessages";
import { MessageInput } from "./MessageInput";
import { useSocket } from "../contexts/SocketContext";

const API_URL = 'http://localhost:8000';

const getAvatarUrl = (avatarPath, fallbackName) => {
  if (!avatarPath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || '?')}`;
  return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
};

const ChatArea = ({ contactName, isTyping, contactImage, contactUserId, currentUser, onSendMessage, onSendAttachment, messages }) => {
  const { onlineUsers } = useSocket();
  const isContactOnline = contactUserId ? onlineUsers.has(contactUserId) : false;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {showSearch ? (
          <div className="flex-1 flex items-center gap-3">
            <Search className="text-slate-400 w-5 h-5 shrink-0" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search messages with ${contactName}...`}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-1.5 px-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={closeSearch} className="text-slate-400 hover:text-white shrink-0" title="Close search">
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={getAvatarUrl(contactImage, contactName)}
                  alt={contactName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${
                    isContactOnline ? 'bg-green-500' : 'bg-slate-500'
                  }`}
                />
              </div>
              <div>
                <h2 className="text-white font-medium">{contactName}</h2>
                {isTyping ? (
                  <p className="text-slate-400 text-sm">Typing...</p>
                ) : (
                  <p className={`text-sm ${isContactOnline ? 'text-green-400' : 'text-slate-500'}`}>
                    {isContactOnline ? 'Online' : 'Offline'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setShowSearch(true)} title="Search in conversation">
                <Search className="text-slate-400 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </button>
              <svg className="text-slate-400 w-5 h-5 cursor-pointer hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <Video className="text-slate-400 w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <img
                src={getAvatarUrl(currentUser?.avatar, currentUser?.username)}
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          </>
        )}
      </div>

      {/* Chat Messages */}
      <ChatMessages currentUser={currentUser} messages={messages} searchQuery={searchQuery} />

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} onSendAttachment={onSendAttachment} />
    </div>
  );
};

ChatArea.propTypes = {
  contactName: PropTypes.string.isRequired,
  isTyping: PropTypes.bool,
  contactImage: PropTypes.string,
  contactUserId: PropTypes.string,
  currentUser: PropTypes.object,
  onSendMessage: PropTypes.func.isRequired,
  onSendAttachment: PropTypes.func.isRequired,
  messages: PropTypes.array
};

ChatArea.defaultProps = {
  isTyping: false,
  contactImage: null,
  currentUser: null
};

export default ChatArea; 