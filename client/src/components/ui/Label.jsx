import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

function Label({ className, required, children, ...props }) {
  return (
    <label className={cn('block text-body-sm font-medium text-text mb-1.5', className)} {...props}>
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

Label.propTypes = {
  className: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node,
};

export { Label };
