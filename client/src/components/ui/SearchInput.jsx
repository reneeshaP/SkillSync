import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const SearchInput = forwardRef(
  ({ className, value, onChange, onClear, loading, placeholder = 'Search', ...props }, ref) => (
    <div className={cn('relative', className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-surface-raised py-2 pl-9 pr-9 text-body-sm text-text placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
      {loading ? (
        <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-subtle" />
      ) : (
        value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
          >
            <X size={16} />
          </button>
        )
      )}
    </div>
  )
);
SearchInput.displayName = 'SearchInput';

SearchInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
};

export { SearchInput };
