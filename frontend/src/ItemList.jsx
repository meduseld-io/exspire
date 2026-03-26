import { useState, useEffect, useRef } from 'react';
import ItemForm from './ItemForm';

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
  if (days >= 183) {
    const years = Math.floor(days / 365);
    const remainingAfterYears = days % 365;
    const months = Math.floor(remainingAfterYears / 30);
    const d = remainingAfterYears % 30;
    if (years > 0) return `${years}y ${months}m ${d}d`;
    return `${months}m ${d}d`;
  }
  return `${days}d`;
}

const MIN_WIDTH = 45;
const MAX_WIDTH = 100;
const SWIPE_THRESHOLD = 60;

const recurrenceLabels = { weekly: '🔄 Weekly', monthly: '🔄 Monthly', yearly: '🔄 Yearly' };

function SwipeableBlock({ item, days, color, catColor, widthPct, delay, onEdit, onDelete, expandedId, setExpandedId, exiting }) {
  const touchRef = useRef({ startX: 0, startY: 0, currentY: 0, swiping: false, locked: false });
  const blockRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);

  // touch-action: none gives JS full control — no browser scroll bounce.
  // We manually scroll the page for vertical gestures.
  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    const onTouchMove = (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchRef.current.startX;
      const dy = touch.clientY - touchRef.current.startY;

      // Decide direction on first significant movement
      if (!touchRef.current.swiping && !touchRef.current.locked) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          touchRef.current.swiping = true;
        } else {
          touchRef.current.locked = true;
          touchRef.current.currentY = touch.clientY;
        }
      }

      if (touchRef.current.locked) {
        // Manually scroll the page since touch-action: none disables native scroll
        const delta = touchRef.current.currentY - touch.clientY;
        touchRef.current.currentY = touch.clientY;
        window.scrollBy(0, delta);
        return;
      }

      if (touchRef.current.swiping) {
        e.preventDefault();
        const base = swiped ? -120 : 0;
        const raw = base + dx;
        setSwipeOffset(Math.max(Math.min(raw, 0), -120));
      }
    };

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [swiped]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, currentY: touch.clientY, swiping: false, locked: false };
  };

  const handleTouchEnd = () => {
    if (touchRef.current.swiping) {
      if (swipeOffset < -SWIPE_THRESHOLD) {
        setSwiped(true);
        setSwipeOffset(-120);
        setExpandedId(item.id);
      } else {
        setSwiped(false);
        setSwipeOffset(0);
        if (expandedId === item.id) setExpandedId(null);
      }
    }
    touchRef.current.swiping = false;
    touchRef.current.locked = false;
  };

  // Close swipe when another item is swiped
  useEffect(() => {
    if (expandedId !== null && expandedId !== item.id && swiped) {
      setSwiped(false);
      setSwipeOffset(0);
    }
  }, [expandedId, item.id, swiped]);

  const handleSwipeOpen = () => {
    if (touchRef.current.swiping) return;
    if (swiped) {
      setSwiped(false);
      setSwipeOffset(0);
      setExpandedId(null);
    } else {
      setExpandedId(expandedId === item.id ? null : item.id);
    }
  };

  return (
    <div key={item.id} className={`spire-row spire-row--enter ${exiting ? 'spire-row--exit' : ''}`} style={{ width: `${widthPct}%`, animationDelay: exiting ? '0s' : `${delay}s` }}>
      <div className="swipe-container">
        <div className="swipe-actions">
          <button className="swipe-btn swipe-btn--edit" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>✏️</button>
          <button className="swipe-btn swipe-btn--delete" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}>🗑️</button>
        </div>
        <div
          ref={blockRef}
          className={`spire-block ${days < 0 ? 'spire-block--expired' : ''} ${expandedId === item.id ? 'spire-block--expanded' : ''}`}
          style={{ borderLeftColor: color, transform: `translateX(${swipeOffset}px)`, transition: touchRef.current.swiping ? 'none' : 'transform 0.2s ease' }}
          onClick={handleSwipeOpen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="spire-block-left">
            <div className="spire-block-header">
              <span className="spire-block-name" style={{ '--cat-color': catColor }}>{item.name}</span>
              <span className="spire-block-category" style={{ background: catColor + '22', color: catColor }}>{item.category}</span>
              {item.recurrence && item.recurrence !== 'none' && (
                <span className="spire-block-recurrence">{recurrenceLabels[item.recurrence]}</span>
              )}
            </div>
            <div className="spire-block-meta spire-block-meta--full">
              {new Date(item.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {item.notify_email && <span> · notify {item.notify_days_before}d before</span>}
            </div>
            <div className="spire-block-meta spire-block-meta--mobile">
              {new Date(item.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {item.recurrence && item.recurrence !== 'none' && <span> · 🔄 {item.recurrence}</span>}
              {item.notify_email && <span> · notify {item.notify_days_before}d before</span>}
            </div>
          </div>
          <div className="spire-block-right">
            <span className="spire-block-urgency" style={{ color }}>{urgencyLabel(days)}</span>
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="spire-btn" aria-label={`Edit ${item.name}`}>✏️</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="spire-btn spire-btn--danger" aria-label={`Delete ${item.name}`}>🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 21;

export default function ItemList({ items, onEdit, onDelete, loading, align = 'center', editing, onSave, onCancel, exitingId }) {
  const [expandedId, setExpandedId] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const prevItemsRef = useRef(new Set());

  const currentIds = new Set(items.map(i => i.id));
  useEffect(() => {
    const prevIds = prevItemsRef.current;
    // Only replay the full build animation when new items appear (add/reload),
    // not when items are removed (delete).
    const hasNewItems = [...currentIds].some(id => !prevIds.has(id));
    if (hasNewItems) {
      setAnimKey(k => k + 1);
      setVisibleCount(PAGE_SIZE);
    }
    prevItemsRef.current = currentIds;
  }, [items]);

  if (loading) {
    return (
      <div className="spire-empty">
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="spire-empty">
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
    <div className="spire" key={animKey} style={{ alignItems: alignMap[align] || 'center' }}>
      {visible.map((item, i) => {
        const days = daysUntil(item.expiry_date);
        const color = urgencyColor(days);
        const catColor = categoryColors[item.category] || categoryColors.other;
        const widthPct = count === 1 ? MAX_WIDTH : MIN_WIDTH + ((MAX_WIDTH - MIN_WIDTH) * i) / (count - 1);
        const perItem = Math.min(0.08, 0.5 / count);
        const delay = (count - 1 - i) * perItem;

        if (editing && item.id === editing.id) {
          return (
            <div key={item.id} className="spire-row" style={{ width: `${widthPct}%` }}>
              <ItemForm initial={editing} onSave={onSave} onCancel={onCancel} inline />
            </div>
          );
        }

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
            exiting={exitingId === item.id}
          />
        );
      })}
      {hasMore && (
        <button className="spire-show-more" onClick={() => setVisibleCount(v => v + PAGE_SIZE)}>
          Show more ({count - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
