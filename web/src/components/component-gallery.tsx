import { useState, useSyncExternalStore } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { components, title } from '@/lib/registry';
import { ComponentPreview } from './component-preview';

export function ComponentGallery({
  initialCategory = '',
}: {
  initialCategory?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const categories = [
    ...new Set(components.flatMap((item) => item.categories ?? [])),
  ].sort();
  const filtered = components
    .filter(
      (item) =>
        (!category || item.categories?.includes(category)) &&
        [item.name, title(item), item.description, ...(item.categories ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(b.meta?.featured === true) - Number(a.meta?.featured === true) ||
        title(a).localeCompare(title(b)),
    );
  return (
    <>
      <div className="gallery-filters">
        <div
          className="category-filters"
          role="group"
          aria-label="Component category"
        >
          <button
            disabled={!ready}
            aria-pressed={!category}
            onClick={() => setCategory('')}
          >
            All components <span>{components.length}</span>
          </button>
          {categories.map((name) => (
            <button
              disabled={!ready}
              key={name}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <label className="gallery-search">
          <Search size={16} />
          <span className="sr-only">Search components</span>
          <input
            disabled={!ready}
            type="search"
            placeholder="Find a component…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="sr-only" role="status">
        {filtered.length} components found
      </p>
      <div className="gallery-grid">
        {filtered.map((item) => (
          <article className="gallery-item" key={item.name}>
            <div className="gallery-preview">
              <ComponentPreview compact name={item.name} />
            </div>
            <div className="gallery-item-info">
              <div>
                <h2>
                  <a href={`/components/${item.name}`}>
                    {title(item)} <ArrowUpRight size={18} />
                  </a>
                </h2>
                <p>{item.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="gallery-empty">
          <h2>No components found</h2>
          <p>Try another name or category.</p>
          <button
            className="button-secondary"
            onClick={() => {
              setQuery('');
              setCategory('');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}

function subscribe() {
  return () => {};
}
