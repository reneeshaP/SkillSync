import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

function Container({ className, children }) {
  return <div className={cn('max-w-4xl mx-auto px-4 md:px-6', className)}>{children}</div>;
}

Container.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Container };
