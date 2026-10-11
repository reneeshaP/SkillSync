import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FileText, Download } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { formatDateDivider } from '../lib/datetime';
import { API_ORIGIN } from '../lib/env';

const GROUP_WINDOW_MS = 5 * 60 * 1000;

const getFileUrl = (path) => (path?.startsWith('http') ? path : `${API_ORIGIN}${path}`);

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

// Builds a flat render list of date-divider and message items, marking each
// message as `grouped` (same sender as the previous one, within GROUP_WINDOW_MS,
// same calendar day) so consecutive messages can collapse their avatar/meta line.
function buildRenderItems(messages) {
  const items = [];
  let prevMessage = null;
  let prevDate = null;

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const isNewDay = !prevDate || date.toDateString() !== prevDate.toDateString();
    if (isNewDay) {
      items.push({ type: 'divider', key: `divider-${message._id}`, label: formatDateDivider(message.createdAt) });
    }

    const grouped =
      !isNewDay &&
      prevMessage &&
      prevMessage.sender?._id === message.sender?._id &&
      date - prevDate < GROUP_WINDOW_MS;

    items.push({ type: 'message', key: message._id, message, grouped });
    prevMessage = message;
    prevDate = date;
  }

  return items;
}

export const ChatMessages = ({ currentUser, messages, searchQuery }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-body-sm">
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
      <div className="flex-1 flex items-center justify-center text-text-muted text-body-sm">
        No messages match "{searchQuery}"
      </div>
    );
  }

  const items = query ? visibleMessages.map((message) => ({ type: 'message', key: message._id, message, grouped: false })) : buildRenderItems(visibleMessages);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-1">
        {items.map((item) => {
          if (item.type === 'divider') {
            return (
              <div key={item.key} className="flex items-center justify-center py-3">
                <span className="text-caption font-medium text-text-subtle bg-surface-overlay rounded-full px-3 py-1">
                  {item.label}
                </span>
              </div>
            );
          }

          const { message, grouped } = item;
          const isMine = message.sender?._id?.toString() === currentUser?._id?.toString();
          const senderName = isMine ? 'You' : (message.sender?.username || 'Unknown');

          return (
            <div key={item.key} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
              {!grouped && (
                <div className={`text-caption text-text-subtle mb-1 ${isMine ? 'mr-10' : 'ml-10'}`}>
                  {formatTime(message.createdAt)} {senderName}
                </div>
              )}

              <div className={`flex items-end gap-2 max-w-xs ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {grouped ? (
                  <div className="w-8 shrink-0" />
                ) : (
                  <Avatar
                    src={isMine ? currentUser?.avatar : message.sender?.avatar}
                    name={isMine ? currentUser?.username : message.sender?.username}
                    userId={isMine ? currentUser?._id : message.sender?._id}
                    size="sm"
                  />
                )}

                <div className={`rounded-2xl px-4 py-2 ${
                  isMine
                    ? 'bg-brand text-brand-fg'
                    : 'bg-surface-raised text-text border border-border'
                }`}>
                  {message.attachment?.url && <Attachment attachment={message.attachment} />}
                  {message.text && <p className="text-sm">{message.text}</p>}
                </div>
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
