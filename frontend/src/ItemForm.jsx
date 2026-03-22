import { useState } from 'react';

const formStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.5rem',
  marginBottom: '1.5rem',
};

const rowStyle = { display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 180 };
const labelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };

export default function ItemForm({ categories, initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || 'subscription',
    expiry_date: initial?.expiry_date?.split('T')[0] || '',
    notify_email: initial?.notify_email || '',
    notify_days_before: initial?.notify_days_before ?? 7,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Name</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Netflix" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Expiry Date</label>
          <input required type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
        </div>
      </div>

      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Notification Email</label>
          <input type="email" value={form.notify_email} onChange={e => set('notify_email', e.target.value)} placeholder="you@example.com" />
        </div>
        <div style={{ ...fieldStyle, maxWidth: 160 }}>
          <label style={labelStyle}>Days Before</label>
          <input type="number" min="0" max="365" value={form.notify_days_before} onChange={e => set('notify_days_before', parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="submit" style={{ background: 'var(--accent)', color: '#fff' }}>{initial ? 'Update' : 'Add Item'}</button>
        <button type="button" onClick={onCancel} style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>Cancel</button>
      </div>
    </form>
  );
}
