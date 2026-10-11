import PropTypes from 'prop-types';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

function ErrorState({ title = 'Something went wrong', body, onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-h4 font-display font-semibold text-text">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-body-sm text-text-muted">{body}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

export { ErrorState };
