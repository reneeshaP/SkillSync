import PropTypes from 'prop-types';

const API_URL = 'http://localhost:8000';

const getAvatarUrl = (avatarPath, fallbackName) => {
  if (!avatarPath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || '?')}`;
  return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
};

const ContactList = ({ selectedContact, onContactSelect, conversations }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        // Skip invalid conversations
        if (!conversation?.otherUser) {
          console.warn('Invalid conversation data:', conversation);
          return null;
        }

        const contact = conversation.otherUser;
        const lastMessage = conversation.lastMessage;
        
        return (
        <div 
            key={conversation._id}
          className={`flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors ${
              selectedContact === contact.username ? 'bg-slate-700' : 'hover:bg-slate-800'
          }`}
            onClick={() => onContactSelect(contact.username)}
        >
          <div className="relative">
            <img 
                src={getAvatarUrl(contact.avatar, contact.username)}
                alt={contact.username}
              className="w-12 h-12 rounded-full object-cover"
            />
              {conversation.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-medium truncate">
                  {contact.username || contact.name || 'Unknown User'}
                </h3>
                {lastMessage?.createdAt && (
                  <span className="text-slate-400 text-sm">
                    {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
              )}
            </div>
              <p className="text-sm truncate text-slate-400">
                {lastMessage?.text || 'No messages yet'}
            </p>
          </div>
        </div>
        );
      }).filter(Boolean)}
    </div>
  );
};

ContactList.propTypes = {
  selectedContact: PropTypes.string.isRequired,
  onContactSelect: PropTypes.func.isRequired,
  conversations: PropTypes.array.isRequired
};

export default ContactList; 