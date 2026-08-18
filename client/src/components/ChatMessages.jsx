import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FileText, Download } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const getAvatarUrl = (avatarPath, fallbackName) => {
  if (!avatarPath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || '?')}`;
  return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
};

const getFileUrl = (path) => (path?.startsWith('http') ? path : `${API_URL}${path}`);

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const Attachment = ({ attachment }) => {
  if (!attachment?.url) return null;
  const url = getFileUrl(attachment.url);

  if (attachment.mimetype?.startsWith('image/')) {
    return (
      <img
        src={url}
        alt={attachment.filename || 'Attachment'}
        className="max-w-full rounded-lg mb-1"
      />
    );
  }

  if (attachment.mimetype?.startsWith('audio/')) {
    return <audio controls src={url} className="max-w-full mb-1" />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-black/10 rounded-lg px-3 py-2 mb-1 hover:bg-black/20 transition-colors"
    >
      <FileText size={18} />
      <span className="text-sm truncate max-w-[10rem]">{attachment.filename || 'File'}</span>
      <Download size={16} className="ml-auto shrink-0" />
    </a>
  );
};

Attachment.propTypes = {
  attachment: PropTypes.shape({
    url: PropTypes.string,
    filename: PropTypes.string,
    mimetype: PropTypes.string
  })
};

export const ChatMessages = ({ currentUser, messages, searchQuery }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        No messages yet — say hello!
      </div>
    );
  }

  const query = searchQuery?.trim().toLowerCase();
  const visibleMessages = query
    ? messages.filter(m =>
        m.text?.toLowerCase().includes(query) ||
        m.attachment?.filename?.toLowerCase().includes(query)
      )
    : messages;

  if (query && visibleMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        No messages match "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-4">
        {visibleMessages.map((message) => {
          const isMine = message.sender?._id?.toString() === currentUser?._id?.toString();
          const senderName = isMine ? 'You' : (message.sender?.username || 'Unknown');

          return (
            <div key={message._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className={`text-xs text-slate-400 mb-1 ${isMine ? 'mr-12' : 'ml-12'}`}>
                {formatTime(message.createdAt)} {senderName}
              </div>

              <div className={`flex items-end gap-2 max-w-xs ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <img
                    src={getAvatarUrl(message.sender?.avatar, message.sender?.username)}
                    alt={senderName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}

                <div className={`rounded-2xl px-4 py-2 ${
                  isMine
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white text-slate-900'
                }`}>
                  {message.attachment?.url && <Attachment attachment={message.attachment} />}
                  {message.text && <p className="text-sm">{message.text}</p>}
                </div>

                {isMine && (
                  <img
                    src={getAvatarUrl(currentUser?.avatar, currentUser?.username)}
                    alt="You"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
    </div>
  );
};

ChatMessages.propTypes = {
  currentUser: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    avatar: PropTypes.string
  }),
  messages: PropTypes.array,
  searchQuery: PropTypes.string
};

export default ChatMessages;
