import { useState, useEffect } from 'react';
import { fetchItems, createItem, updateItem, deleteItem, sendTestNotification } from './api.js';
import ItemForm from './ItemForm.jsx';
import ItemList from './ItemList.jsx';

const CATEGORIES = ['subscription', 'document', 'warranty', 'membership', 'insurance', 'domain', 'license', 'other'];

export default function App() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [testSending, setTestSending] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      setItems(await fetchItems());
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Could not load items');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateItem(editing.id, data);
      } else {
        await createItem(data);
      }
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('Could not save item');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      load();
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Could not delete item');
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
      setError(null);
    } catch (err) {
      console.error('Failed to send test notification:', err);
      setError(err.message);
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo-group">
          <img src="/logo.png" alt="ExSpire" className="app-logo" />
          <span className="app-title">ExSpire</span>
        </div>
        {!showForm && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-test" onClick={handleTestNotification} disabled={testSending}>
              {testSending ? 'Sending…' : '📧 Test'}
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Item</button>
          </div>
        )}
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)} className="error-dismiss">✕</button>
        </div>
      )}

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
          <button className={`filter-chip ${filter === 'all' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`filter-chip ${filter === cat ? 'filter-chip--active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>
      )}

      <ItemList items={filter === 'all' ? items : items.filter(i => i.category === filter)} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
