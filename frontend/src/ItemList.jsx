import { useState, useEffect, useRef } from 'react';

const categoryColors = {
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

// Width ranges from MIN_WIDTH% (top, most urgent) to MAX_WIDTH% (bottom, least urgent)
const MIN_WIDTH = 45;
const MAX_WIDTH = 100;

export default function ItemList({ items, onEdit, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const prevItemsRef = useRef('');

  // Trigger rebuild animation when the filtered set changes
  const itemIds = items.map(i => i.id).join(',');
  useEffect(() => {
    if (prevItemsRef.current !== itemIds) {
      prevItemsRef.current = itemIds;
      setAnimKey(k => k + 1);
    }
  }, [itemIds]);

  if (!items.length) {
    return (
      <div className="tower-empty">
        No items yet. Add something that's expiring soon.
      </div>
    );
  }

  // Sort: soonest expiry first (top of tower)
  const sorted = [...items].sort((a, b) => {
    const da = daysUntil(a.expiry_date);
    const db = daysUntil(b.expiry_date);
    return da - db;
  });

  const count = sorted.length;

  return (
    <div className="tower" key={animKey}>
      {sorted.map((item, i) => {
        const days = daysUntil(item.expiry_date);
        const color = urgencyColor(days);
        const catColor = categoryColors[item.category] || categoryColors.other;

        // Linear interpolation: top item (i=0) gets MIN_WIDTH, bottom item gets MAX_WIDTH
        const widthPct = count === 1 ? MAX_WIDTH : MIN_WIDTH + ((MAX_WIDTH - MIN_WIDTH) * i) / (count - 1);

        // Bottom-up stagger: last item (bottom) animates first
        // Adaptive delay: total animation ~0.5s regardless of count
        const perItem = Math.min(0.08, 0.5 / count);
        const delay = (count - 1 - i) * perItem;

        return (
          <div key={item.id} className="tower-row tower-row--enter" style={{ width: `${widthPct}%`, animationDelay: `${delay}s` }}>
            <div
              className={`tower-block ${days < 0 ? 'tower-block--expired' : ''} ${expandedId === item.id ? 'tower-block--expanded' : ''}`}
              style={{ borderLeftColor: color }}
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="tower-block-left">
                <div className="tower-block-header">
                  <span className="tower-block-name" style={{ '--cat-color': catColor }}>{item.name}</span>
                  <span
                    className="tower-block-category"
                    style={{ background: catColor + '22', color: catColor }}
                  >
                    {item.category}
                  </span>
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
                <span className="tower-block-urgency" style={{ color }}>
                  {urgencyLabel(days)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="tower-btn"
                  aria-label={`Edit ${item.name}`}
                >✏️</button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="tower-btn tower-btn--danger"
                  aria-label={`Delete ${item.name}`}
                >🗑️</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
