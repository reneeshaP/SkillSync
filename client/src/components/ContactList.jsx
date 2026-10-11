import PropTypes from 'prop-types';
import { Avatar } from './ui/Avatar';

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
              selectedContact === contact.username ? 'bg-surface-overlay' : 'hover:bg-surface-raised'
          }`}
            onClick={() => onContactSelect(contact.username)}
        >
          <div className="relative">
            <Avatar src={contact.avatar} name={contact.username} userId={contact._id} size="lg" />
              {conversation.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand rounded-full border-2 border-bg"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <h3 className="text-text font-medium truncate">
                  {contact.username || contact.name || 'Unknown User'}
                </h3>
                {lastMessage?.createdAt && (
                  <span className="text-text-subtle text-caption shrink-0 ml-2">
                    {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
              )}
            </div>
              <p className="text-body-sm truncate text-text-muted">
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
