import React, { useEffect, useState, useRef } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import './Items.css';

function Items() {
  const { itemsData, fetchItems } = useData();
  const { items, total, page, limit } = itemsData;
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchItems({ q, page, limit, signal: controller.signal })
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [q, page, fetchItems, limit]);

  const skeletonCount = Math.min(limit, 10);

  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div
        role="listitem"
        style={style}
        className="item-row"
      >
        <Link to={`/items/${item.id}`}>{item.name}</Link>
      </div>
    );
  };

  return (
    <section aria-labelledby="items-heading">
      <h2 id="items-heading" className="visually-hidden">Items List</h2>

      <div className="search-container">
        <label htmlFor="item-search" className="visually-hidden">Search items</label>
        <input
          id="item-search"
          type="text"
          value={q}
          placeholder="Search items…"
          onChange={e => setQ(e.target.value)}
          aria-label="Search items"
          className="search-input"
        />
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="skeleton-list">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p role="status">No items found.</p>
      ) : (
        <List
          className="items-list"
          height={400}
          itemCount={items.length}
          itemSize={50}
          width="100%"
          role="list"
        >
          {Row}
        </List>
      )}

      <nav
        className="pagination"
        role="navigation"
        aria-label="Pagination"
      >
        <button
          onClick={() => fetchItems({ q, page: page - 1, limit })}
          disabled={page <= 1}
          aria-label="Previous page"
          className="page-button"
        >
          Prev
        </button>
        <span aria-live="polite" className="page-info">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => fetchItems({ q, page: page + 1, limit })}
          disabled={page * limit >= total}
          aria-label="Next page"
          className="page-button"
        >
          Next
        </button>
      </nav>
    </section>
  );
}

export default Items;