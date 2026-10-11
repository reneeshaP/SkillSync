import PropTypes from 'prop-types';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

const ConnectionRequestPopup = ({ request, onAccept, onIgnore }) => {
  return (
    <div className="bg-surface-raised border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          src={request.sender.avatar}
          name={request.sender.username}
          userId={request.sender._id}
          size="md"
        />
        <div>
          <h4 className="text-text font-medium">{request.sender.username}</h4>
          <p className="text-body-sm text-text-muted">Wants to connect with you</p>
        </div>
      </div>

      <p className="text-text-muted text-body-sm mb-4">
        "Hey, Hope you're doing well. May I connect with you?"
      </p>

      <div className="flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={() => onAccept(request._id)}>
          Accept
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onIgnore(request._id)}>
          Ignore
        </Button>
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
