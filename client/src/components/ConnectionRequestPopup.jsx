import PropTypes from 'prop-types';

const API_URL = 'http://localhost:8000';

const getAvatarUrl = (avatarPath, fallbackName) => {
  if (!avatarPath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || '?')}`;
  return avatarPath.startsWith('http') ? avatarPath : `${API_URL}${avatarPath}`;
};

const ConnectionRequestPopup = ({ request, onAccept, onIgnore }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-4 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={getAvatarUrl(request.sender.avatar, request.sender.username)}
          alt={request.sender.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h4 className="text-white font-medium">{request.sender.username}</h4>
          <p className="text-sm text-slate-400">Wants to connect with you</p>
        </div>
      </div>
      
      <p className="text-slate-300 text-sm mb-4">
        "Hey, Hope you're doing well. May I connect with you?"
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(request._id)}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
        >
          Accept
        </button>
        <button
          onClick={() => onIgnore(request._id)}
          className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition"
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

ConnectionRequestPopup.propTypes = {
  request: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string
    }).isRequired
  }).isRequired,
  onAccept: PropTypes.func.isRequired,
  onIgnore: PropTypes.func.isRequired
};

export default ConnectionRequestPopup; 