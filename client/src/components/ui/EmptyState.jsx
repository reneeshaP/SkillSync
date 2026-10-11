import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';
import { Button } from './Button';

function EmptyState({ icon: Icon, title, body, actionLabel, onAction, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-overlay text-text-subtle">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-h4 font-display font-semibold text-text">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-body-sm text-text-muted">{body}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export { EmptyState };
