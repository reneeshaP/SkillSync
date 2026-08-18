import PropTypes from 'prop-types';
import { Menu, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContactList from "./ContactList";
import ConnectionRequestPopup from "./ConnectionRequestPopup";

const MessageSidebar = ({
  selectedContact,
  onContactSelect,
  conversations,
  pendingRequests,
  onAcceptRequest,
  onIgnoreRequest,
  searchQuery,
  onSearchChange
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors"
            title="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Menu className="text-slate-400 w-5 h-5" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-white text-lg font-medium">Messaging</span>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find people to message..."
            className="w-full bg-slate-800 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Connection Requests */}
      {pendingRequests.length > 0 && (
        <div className="p-4">
          <h3 className="text-white text-sm font-medium mb-2">Connection Requests</h3>
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
        <h2 className="text-white text-lg font-medium">Chat</h2>
      </div>

      {/* Contact List */}
      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          No conversations yet
        </div>
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
  onSearchChange: PropTypes.func.isRequired
};

export default MessageSidebar; 