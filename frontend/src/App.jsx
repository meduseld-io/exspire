import { useState, useEffect, useCallback } from 'react';
import { fetchItems, createItem, updateItem, deleteItem, sendTestNotification } from './api.js';
import ItemForm from './ItemForm.jsx';
import ItemList from './ItemList.jsx';

const CATEGORIES = ['subscription', 'document', 'warranty', 'membership', 'insurance', 'domain', 'license'];

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
        {!showForm && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
          </div>
        )}
      </header>

      {showForm && (
        <ItemForm
          categories={CATEGORIES}
          initial={editing}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {!showForm && (
        <div className="filter-bar">
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

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}
