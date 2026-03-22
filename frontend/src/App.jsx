import { useState, useEffect, useCallback } from 'react';
import { fetchItems, createItem, updateItem, deleteItem, sendTestNotification, getVapidKey, subscribePush, unsubscribePush, testPush } from './api.js';
import ItemForm from './ItemForm.jsx';
import ItemList from './ItemList.jsx';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function SettingsModal({ settings, onSave, onClose, addToast }) {
  const [email, setEmail] = useState(settings.email || '');
  const [pushEnabled, setPushEnabled] = useState(settings.pushEnabled || false);
  const [pushLoading, setPushLoading] = useState(false);

  const handlePushToggle = async () => {
    setPushLoading(true);
    try {
      if (!pushEnabled) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          addToast('Notification permission denied', 'error');
          setPushLoading(false);
          return;
        }
        const { publicKey } = await getVapidKey();
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await subscribePush(subscription.toJSON());
        setPushEnabled(true);
        addToast('Push notifications enabled');
      } else {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) {
          await unsubscribePush(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setPushEnabled(false);
        addToast('Push notifications disabled');
      }
    } catch (err) {
      console.error('Failed to toggle push notifications:', err);
      addToast('Could not toggle push', 'error');
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    try {
      await testPush();
      addToast('Test push sent');
    } catch (err) {
      console.error('Failed to send test push:', err);
      addToast(err.message, 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...settings, email, pushEnabled });
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="settings-profile">
          <span className="profile-avatar profile-avatar--lg">T</span>
          <div>
            <div className="settings-name">Test User</div>
            <div className="settings-sub">test@exspire.app</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <span className="settings-section-title">Integrations</span>
            <div className="settings-field">
              <label className="settings-label">📧 Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <span className="settings-hint">Used when items have email notifications enabled</span>
            </div>
            <div className="settings-field" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="settings-label">🔔 Push notifications</label>
                <button
                  type="button"
                  className={`toggle-btn ${pushEnabled ? 'toggle-btn--on' : ''}`}
                  onClick={handlePushToggle}
                  disabled={pushLoading}
                >
                  {pushLoading ? '…' : (pushEnabled ? 'On' : 'Off')}
                </button>
              </div>
              <span className="settings-hint">Browser push notifications for expiring items</span>
              {pushEnabled && (
                <button type="button" className="btn-test" style={{ marginTop: '0.35rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={handleTestPush}>
                  Send test push
                </button>
              )}
            </div>
          </div>

          <div className="settings-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('exspire_settings') || '{}');
    } catch (e) {
      console.error('Failed to parse settings from localStorage:', e);
      return {};
    }
  });

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const load = async () => {
    try {
      setItems(await fetchItems());
    } catch (err) {
      console.error('Failed to load items:', err);
      addToast('Could not load items', 'error');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateItem(editing.id, data);
        addToast('Item updated');
      } else {
        await createItem(data);
        addToast('Item added');
      }
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      console.error('Failed to save item:', err);
      addToast('Could not save item', 'error');
    }
  };

  const handleDeleteRequest = (id) => {
    const item = items.find(i => i.id === id);
    setDeleteConfirm({ id, name: item?.name || 'this item' });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteItem(deleteConfirm.id);
      addToast('Item deleted');
      load();
    } catch (err) {
      console.error('Failed to delete item:', err);
      addToast('Could not delete item', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
  };

  const handleTestNotification = async () => {
    setTestSending(true);
    try {
      await sendTestNotification('dylan_martin@mail.com');
      addToast('Test email sent');
    } catch (err) {
      console.error('Failed to send test notification:', err);
      addToast(err.message, 'error');
    } finally {
      setTestSending(false);
    }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('exspire_settings', JSON.stringify(newSettings));
    setShowSettings(false);
    addToast('Settings saved');
  };

  const categoryCount = (cat) => items.filter(i => i.category === cat).length;

  const allCategories = [...new Set(items.map(i => i.category))].sort();

  const filteredItems = (filter === 'all' ? items : items.filter(i => i.category === filter))
    .filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo-group">
          <img src="/logo.png" alt="ExSpire" className="app-logo" />
          <span className="app-title">ExSpire</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!showForm && (
            <>
              {searchOpen ? (
                <div className="search-inline">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search items…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button className="btn-icon" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>✕</button>
                </div>
              ) : (
                <button className="btn-icon" onClick={() => setSearchOpen(true)}>🔍</button>
              )}
              <button className="btn-test" onClick={handleTestNotification} disabled={testSending}>
                {testSending ? 'Sending…' : '📧 Test'}
              </button>
              <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Item</button>
            </>
          )}
          <button className="btn-profile" onClick={() => setShowSettings(true)}>
            <span className="profile-avatar">T</span>
          </button>
        </div>
      </header>

      {showForm && (
        <ItemForm
          initial={editing}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {!showForm && (
        <>
          <div className="filter-bar filter-bar--desktop">
            <button className={`filter-chip ${filter === 'all' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('all')}>
              All <span className="filter-count">{items.length}</span>
            </button>
            {allCategories.map(cat => {
              const count = categoryCount(cat);
              return (
                <button key={cat} className={`filter-chip ${filter === cat ? 'filter-chip--active' : ''}`} onClick={() => setFilter(cat)}>
                  {cat} <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="filter-bar filter-bar--mobile">
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All ({items.length})</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat} ({categoryCount(cat)})</option>
              ))}
            </select>
          </div>
        </>
      )}

      <ItemList items={filteredItems} onEdit={handleEdit} onDelete={handleDeleteRequest} />

      {deleteConfirm && (
        <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p>Delete <strong>{deleteConfirm.name}</strong>?</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSettings && <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} addToast={addToast} />}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}
