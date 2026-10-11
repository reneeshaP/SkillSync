import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar } from './ui/Avatar';
import { SearchInput } from './ui/SearchInput';
import { cn } from '../lib/utils';

// A grouped combobox (People / Posts) over data the page already fetches —
// no new search capability, just a keyboard-operable presentation of it.
export default function FeedSearch({ query, onQueryChange, people, peopleLoading, posts, onSelectPerson, onSelectPost }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const matchingPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return posts
      .filter((post) => post.content?.toLowerCase().includes(q) || post.tags?.some((tag) => tag.toLowerCase().includes(q)))
      .slice(0, 5);
  }, [query, posts]);

  const items = useMemo(
    () => [
      ...people.map((person) => ({ type: 'person', data: person })),
      ...matchingPosts.map((post) => ({ type: 'post', data: post })),
    ],
    [people, matchingPosts]
  );

  const showDropdown = isOpen && query.trim().length > 0;

  const selectItem = (item) => {
    if (!item) return;
    if (item.type === 'person') {
      onSelectPerson(item.data);
    } else {
      onSelectPost(item.data._id);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectItem(items[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative max-w-xl">
      <SearchInput
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onClear={() => {
          onQueryChange('');
          setIsOpen(false);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        loading={peopleLoading}
        placeholder="Search SkillSync"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />

      {showDropdown && (
        <div
          role="listbox"
          className="absolute top-full mt-2 w-full bg-surface-raised border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-text-muted text-center">No results for &ldquo;{query.trim()}&rdquo;</p>
          ) : (
            <>
              {people.length > 0 && (
                <div>
                  <p className="text-xs text-text-subtle px-3 pt-2">People</p>
                  {people.map((person) => {
                    const index = items.findIndex((item) => item.type === 'person' && item.data._id === person._id);
                    return (
                      <div
                        key={person._id}
                        role="option"
                        aria-selected={index === highlightedIndex}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => selectItem({ type: 'person', data: person })}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 cursor-pointer',
                          index === highlightedIndex ? 'bg-surface-overlay' : 'hover:bg-surface-overlay'
                        )}
                      >
                        <Avatar src={person.avatar} name={person.username} userId={person._id} size="sm" />
                        <span className="text-sm text-text">{person.username}</span>
                        {person.role && <span className="text-xs text-brand capitalize ml-auto">{person.role}</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {matchingPosts.length > 0 && (
                <div>
                  <p className="text-xs text-text-subtle px-3 pt-2">Posts</p>
                  {matchingPosts.map((post) => {
                    const index = items.findIndex((item) => item.type === 'post' && item.data._id === post._id);
                    return (
                      <div
                        key={post._id}
                        role="option"
                        aria-selected={index === highlightedIndex}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => selectItem({ type: 'post', data: post })}
                        className={cn(
                          'px-3 py-2 cursor-pointer',
                          index === highlightedIndex ? 'bg-surface-overlay' : 'hover:bg-surface-overlay'
                        )}
                      >
                        <p className="text-sm text-text line-clamp-1">{post.content}</p>
                        <p className="text-xs text-text-subtle">by {post.userId?.username}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

FeedSearch.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  people: PropTypes.array.isRequired,
  peopleLoading: PropTypes.bool,
  posts: PropTypes.array.isRequired,
  onSelectPerson: PropTypes.func.isRequired,
  onSelectPost: PropTypes.func.isRequired,
};
