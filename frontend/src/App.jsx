import { useState, useEffect } from 'react';
import { fetchItems, createItem, updateItem, deleteItem } from './api.js';
import ItemForm from './ItemForm.jsx';
import ItemList from './ItemList.jsx';

const CATEGORIES = ['subscription', 'document', 'warranty', 'membership', 'insurance', 'domain', 'license', 'other'];

export default function App() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo-group">
          <img src="/logo.png" alt="ExSpire" className="app-logo" />
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Item</button>
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

      <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
