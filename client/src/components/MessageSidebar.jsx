import PropTypes from 'prop-types';
import ContactList from "./ContactList";
import ConnectionRequestPopup from "./ConnectionRequestPopup";
import { Avatar } from './ui/Avatar';
import { SearchInput } from './ui/SearchInput';
import { EmptyState } from './ui/EmptyState';
import { MessageCircle } from 'lucide-react';

const MessageSidebar = ({
  selectedContact,
  onContactSelect,
  conversations,
  pendingRequests,
  onAcceptRequest,
  onIgnoreRequest,
  searchQuery,
  onSearchChange,
  isSearching,
  searchResults,
  onSelectSearchResult,
  mobileHidden
}) => {
  return (
    <div className={`${mobileHidden ? 'hidden' : 'flex'} lg:flex w-full lg:w-80 lg:shrink-0 bg-surface border-r border-border flex-col min-h-0`}>
      {/* Header */}
      <div className="p-4 border-b border-border relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-text text-h4 font-display font-medium">Messaging</span>
        </div>
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Find people to message..."
        />

        {isSearching && searchResults.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-surface-raised border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            {searchResults.map((result) => (
              <div
                key={result._id}
                className="p-3 hover:bg-surface-overlay cursor-pointer flex items-center gap-3"
                onClick={() => onSelectSearchResult(result._id, result.username)}
              >
                <Avatar src={result.avatar} name={result.username} userId={result._id} size="sm" />
                <span className="text-text text-body-sm">{result.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Requests */}
      {pendingRequests.length > 0 && (
        <div className="p-4">
          <h3 className="text-text text-body-sm font-medium mb-2">Connection Requests</h3>
          {pendingRequests.map(request => (
            <ConnectionRequestPopup
              key={request._id}
              request={request}
              onAccept={onAcceptRequest}
              onIgnore={onIgnoreRequest}
            />
          ))}
        </div>
      )}

      {/* Chat label */}
      <div className="p-4 pb-2">
        <h2 className="text-text text-h4 font-display font-medium">Chat</h2>
      </div>

      {/* Contact List */}
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No conversations yet" body="Search for someone above to start a conversation." />
      ) : (
        <ContactList
          selectedContact={selectedContact}
          onContactSelect={onContactSelect}
          conversations={conversations}
        />
      )}
    </div>
  );
};

MessageSidebar.propTypes = {
  selectedContact: PropTypes.string.isRequired,
  onContactSelect: PropTypes.func.isRequired,
  conversations: PropTypes.array.isRequired,
  pendingRequests: PropTypes.array.isRequired,
  onAcceptRequest: PropTypes.func.isRequired,
  onIgnoreRequest: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  isSearching: PropTypes.bool.isRequired,
  searchResults: PropTypes.array.isRequired,
  onSelectSearchResult: PropTypes.func.isRequired,
  mobileHidden: PropTypes.bool
};

export default MessageSidebar;
