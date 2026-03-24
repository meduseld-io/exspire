import { useState, useEffect } from 'react';
import { fetchAdminUsers, fetchAdminUserItems } from './api.js';
import { categoryColors } from './ItemList.jsx';

function daysUntil(dateStr) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days) {
  if (days < 0) return 'var(--text-muted)';
  if (days <= 3) return 'var(--danger)';
  if (days <= 14) return 'var(--warning)';
  return 'var(--success)';
}

export default function AdminPanel({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userItems, setUserItems] = useState({});
  const [itemsLoading, setItemsLoading] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await fetchAdminUsers());
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (!userItems[userId]) {
      setItemsLoading(prev => ({ ...prev, [userId]: true }));
      try {
        const items = await fetchAdminUserItems(userId);
        setUserItems(prev => ({ ...prev, [userId]: items }));
      } catch (err) {
        console.error('Failed to load user items:', err);
      } finally {
        setItemsLoading(prev => ({ ...prev, [userId]: false }));
      }
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button className="btn-test" onClick={onBack}>← Back</button>
        <h2 className="admin-title">Admin Panel</h2>
        <span className="admin-badge">{users.length} users</span>
      </div>

      {loading ? (
        <div className="spire-empty"><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className="admin-users">
          {users.map(u => (
            <div key={u.id} className="admin-user-card">
              <div className="admin-user-row" onClick={() => toggleUser(u.id)}>
                <span className="profile-avatar" style={{ fontSize: '0.7rem', width: 28, height: 28 }}>
                  {u.displayName?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                </span>
                <div className="admin-user-info">
                  <span className="admin-user-name">
                    {u.displayName || u.email}
                    {u.isAdmin && <span className="admin-role-badge">Admin</span>}
                  </span>
                  <span className="admin-user-meta">{u.email} · {u.itemCount} items</span>
                </div>
                <span className="admin-expand">{expandedUser === u.id ? '▾' : '▸'}</span>
              </div>

              {expandedUser === u.id && (
                <div className="admin-user-items">
                  {itemsLoading[u.id] ? (
                    <div className="spinner spinner--sm" style={{ margin: '0.5rem auto' }} />
                  ) : !userItems[u.id]?.length ? (
                    <p className="admin-no-items">No items</p>
                  ) : (
                    userItems[u.id].map(item => {
                      const days = daysUntil(item.expiry_date);
                      const color = urgencyColor(days);
                      const catColor = categoryColors[item.category] || categoryColors.other;
                      return (
                        <div key={item.id} className="admin-item">
                          <span className="admin-item-name">{item.name}</span>
                          <span className="admin-item-cat" style={{ background: catColor + '22', color: catColor }}>{item.category}</span>
                          <span className="admin-item-date">{new Date(item.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="admin-item-urgency" style={{ color }}>{days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days}d`}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
