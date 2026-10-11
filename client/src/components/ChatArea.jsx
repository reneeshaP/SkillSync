import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft } from 'lucide-react';
import ChatMessages from "./ChatMessages";
import { MessageInput } from "./MessageInput";
import { useSocket } from "../contexts/SocketContext";
import { Avatar } from "./ui/Avatar";
import { IconButton } from "./ui/IconButton";
import { SearchInput } from "./ui/SearchInput";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/Tooltip";

const ChatArea = ({ contactName, isTyping, contactImage, contactUserId, currentUser, onSendMessage, onSendAttachment, onTyping, messages, onBack }) => {
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();
  const isContactOnline = contactUserId ? onlineUsers.has(contactUserId) : false;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex-1 flex flex-col bg-bg min-h-0">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        {showSearch ? (
          <div className="flex-1 flex items-center gap-3">
            <SearchInput
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder={`Search messages with ${contactName}...`}
              className="flex-1"
            />
            <IconButton aria-label="Close search" onClick={closeSearch} className="shrink-0">
              <X size={20} />
            </IconButton>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <IconButton aria-label="Back to conversations" onClick={onBack} className="lg:hidden -ml-2 shrink-0">
                <ArrowLeft size={20} />
              </IconButton>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="cursor-pointer shrink-0"
                    onClick={() => contactUserId && navigate(`/profile/${contactUserId}`)}
                  >
                    <Avatar
                      src={contactImage}
                      name={contactName}
                      userId={contactUserId}
                      size="md"
                      presence={isContactOnline ? 'online' : 'offline'}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{isContactOnline ? 'Online' : 'Offline'}</TooltipContent>
              </Tooltip>
              <div className="min-w-0">
                <h2 className="text-text font-medium truncate">{contactName}</h2>
                {isTyping ? (
                  <p className="text-text-muted text-body-sm">Typing...</p>
                ) : (
                  <p className={`text-body-sm ${isContactOnline ? 'text-success' : 'text-text-subtle'}`}>
                    {isContactOnline ? 'Online' : 'Offline'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <IconButton aria-label="Search in conversation" onClick={() => setShowSearch(true)}>
                <Search size={20} />
              </IconButton>
              <div className="cursor-pointer" onClick={() => navigate('/userprofile')}>
                <Avatar src={currentUser?.avatar} name={currentUser?.username} userId={currentUser?._id} size="sm" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chat Messages */}
      <ChatMessages currentUser={currentUser} messages={messages} searchQuery={searchQuery} />

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} onSendAttachment={onSendAttachment} onTyping={onTyping} />
    </div>
    </TooltipProvider>
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
  onTyping: PropTypes.func,
  messages: PropTypes.array,
  onBack: PropTypes.func
};

ChatArea.defaultProps = {
  isTyping: false,
  contactImage: null,
  currentUser: null
};

export default ChatArea;
