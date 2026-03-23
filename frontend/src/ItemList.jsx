import { useState, useEffect, useRef } from 'react';

export const categoryColors = {
  subscription: '#6366f1',
  document: '#f59e0b',
  warranty: '#22c55e',
  membership: '#ec4899',
  insurance: '#14b8a6',
  domain: '#8b5cf6',
  license: '#f97316',
  other: '#64748b',
};

function daysUntil(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days) {
  if (days < 0) return 'var(--text-muted)';
  if (days <= 3) return 'var(--danger)';
  if (days <= 14) return 'var(--warning)';
  return 'var(--success)';
}

function urgencyLabel(days) {
  if (days < 0) return 'ExSpired';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
}

const MIN_WIDTH = 45;
const MAX_WIDTH = 100;
const SWIPE_THRESHOLD = 60;

function SwipeableBlock({ item, days, color, catColor, widthPct, delay, onEdit, onDelete, expandedId, setExpandedId }) {
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, swiping: false };
    setSwiped(false);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;

    // Only swipe left, and only if horizontal movement dominates
    if (!touchRef.current.swiping && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      touchRef.current.swiping = true;
    }
    if (touchRef.current.swiping && dx < 0) {
      e.preventDefault();
      setSwipeOffset(Math.max(dx, -120));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset < -SWIPE_THRESHOLD) {
      setSwiped(true);
      setSwipeOffset(-120);
    } else {
      setSwipeOffset(0);
    }
    touchRef.current.swiping = false;
  };

  // Close swipe when another item is swiped
  useEffect(() => {
    if (expandedId !== item.id && swiped) {
      setSwiped(false);
      setSwipeOffset(0);
    }
  }, [expandedId, item.id, swiped]);

  const handleSwipeOpen = () => {
    if (touchRef.current.swiping) return;
    if (swiped) {
      setSwiped(false);
      setSwipeOffset(0);
    } else {
      setExpandedId(expandedId === item.id ? null : item.id);
    }
  };

  return (
    <div key={item.id} className="tower-row tower-row--enter" style={{ width: `${widthPct}%`, animationDelay: `${delay}s` }}>
      <div className="swipe-container">
        <div className="swipe-actions">
          <button className="swipe-btn swipe-btn--edit" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>✏️</button>
          <button className="swipe-btn swipe-btn--delete" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}>🗑️</button>
        </div>
        <div
          className={`tower-block ${days < 0 ? 'tower-block--expired' : ''} ${expandedId === item.id ? 'tower-block--expanded' : ''}`}
          style={{ borderLeftColor: color, transform: `translateX(${swipeOffset}px)`, transition: touchRef.current.swiping ? 'none' : 'transform 0.2s ease' }}
          onClick={handleSwipeOpen}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="tower-block-left">
            <div className="tower-block-header">
              <span className="tower-block-name" style={{ '--cat-color': catColor }}>{item.name}</span>
              <span className="tower-block-category" style={{ background: catColor + '22', color: catColor }}>{item.category}</span>
            </div>
            <div className="tower-block-meta tower-block-meta--full">
              {new Date(item.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {item.notify_email && <span> · notify {item.notify_days_before}d before</span>}
            </div>
            <div className="tower-block-meta tower-block-meta--mobile">
              {item.notify_email && <span>notify {item.notify_days_before}d before</span>}
            </div>
          </div>
          <div className="tower-block-right">
            <span className="tower-block-urgency" style={{ color }}>{urgencyLabel(days)}</span>
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="tower-btn" aria-label={`Edit ${item.name}`}>✏️</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="tower-btn tower-btn--danger" aria-label={`Delete ${item.name}`}>🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 21;

export default function ItemList({ items, onEdit, onDelete, loading, align = 'center' }) {
  const [expandedId, setExpandedId] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const prevItemsRef = useRef('');

  const itemIds = items.map(i => i.id).join(',');
  useEffect(() => {
    if (prevItemsRef.current !== itemIds) {
      prevItemsRef.current = itemIds;
      setAnimKey(k => k + 1);
      setVisibleCount(PAGE_SIZE);
    }
  }, [itemIds]);

  if (loading) {
    return (
      <div className="tower-empty">
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="tower-empty">
        No items yet. Add something that's expiring soon.
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => daysUntil(a.expiry_date) - daysUntil(b.expiry_date));
  const count = sorted.length;
  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < count;

  const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

  return (
    <div className="tower" key={animKey} style={{ alignItems: alignMap[align] || 'center' }}>
      {visible.map((item, i) => {
        const days = daysUntil(item.expiry_date);
        const color = urgencyColor(days);
        const catColor = categoryColors[item.category] || categoryColors.other;
        const widthPct = count === 1 ? MAX_WIDTH : MIN_WIDTH + ((MAX_WIDTH - MIN_WIDTH) * i) / (count - 1);
        const perItem = Math.min(0.08, 0.5 / count);
        const delay = (count - 1 - i) * perItem;

        return (
          <SwipeableBlock
            key={item.id}
            item={item}
            days={days}
            color={color}
            catColor={catColor}
            widthPct={widthPct}
            delay={delay}
            onEdit={onEdit}
            onDelete={onDelete}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        );
      })}
      {hasMore && (
        <button className="tower-show-more" onClick={() => setVisibleCount(v => v + PAGE_SIZE)}>
          Show more ({count - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
