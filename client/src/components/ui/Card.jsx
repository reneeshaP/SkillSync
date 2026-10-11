import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

function Card({ className, raised, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border shadow-sm',
        raised ? 'bg-surface-raised' : 'bg-surface',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  className: PropTypes.string,
  raised: PropTypes.bool,
  children: PropTypes.node,
};

export { Card };
