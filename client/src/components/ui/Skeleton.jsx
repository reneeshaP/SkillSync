import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-overlay', className)} />;
}

Skeleton.propTypes = {
  className: PropTypes.string,
};

export { Skeleton };
