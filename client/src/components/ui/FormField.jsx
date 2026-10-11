import PropTypes from 'prop-types';
import { Label } from './Label';
import { cn } from '../../lib/utils';

function FormField({ label, hint, error, required, htmlFor, className, children }) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p id={hintId} className="text-caption text-text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

export { FormField };
