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

const PRESET_CATEGORIES = ['subscription', 'document', 'warranty', 'membership', 'insurance', 'domain', 'license'];

export default function ItemForm({ initial, onSave, onCancel, inline }) {
  const isCustomInitial = initial?.category && !PRESET_CATEGORIES.includes(initial.category) && initial.category !== 'other';

  const [form, setForm] = useState({
    name: initial?.name || '',
    category: isCustomInitial ? '__custom__' : (initial?.category || 'subscription'),
    customCategory: isCustomInitial ? initial.category : '',
    expiry_date: initial?.expiry_date?.split('T')[0] || '',
    notify_type: initial?.notify_push ? 'push' : (initial?.notify_email ? 'email' : 'none'),
    notify_days_before: initial?.notify_days_before ?? 7,
    recurrence: initial?.recurrence || 'none',
  });
  const [dateError, setDateError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const today = new Date().toISOString().split('T')[0];

  function validateExpiryDate(dateStr) {
    if (!dateStr) return 'Expiry date is required';
    const year = parseInt(dateStr.split('-')[0], 10);
    if (isNaN(year) || year < 2000 || year > 2100) return 'Year must be between 2000 and 2100';
    if (dateStr < today) return 'Expiry date cannot be in the past';
    return '';
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateExpiryDate(form.expiry_date);
    if (err) { setDateError(err); return; }
    const { customCategory, notify_type, ...data } = form;
    if (data.category === '__custom__') {
      data.category = customCategory.trim().toLowerCase() || 'other';
    }
    // Pull email from settings if notification type is email
    const settings = JSON.parse(localStorage.getItem('exspire_settings') || '{}');
    const userEmail = settings.email || '';
    data.notify_email = notify_type === 'email' ? userEmail : '';
    data.notify_push = notify_type === 'push';
    onSave(data);
  };

  const style = inline
    ? { ...formStyle, marginBottom: 0, padding: '1rem' }
    : formStyle;

  return (
    <form onSubmit={handleSubmit} style={style}>
      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Name</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Netflix" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            <option value="__custom__">Custom…</option>
          </select>
          {form.category === '__custom__' && (
            <input
              style={{ marginTop: '0.35rem' }}
              value={form.customCategory}
              onChange={e => set('customCategory', e.target.value)}
              placeholder="e.g. pet, vehicle, travel"
              required
            />
          )}
        </div>
      </div>

      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Expiry Date</label>
          <input required type="date" min={today} max="2100-12-31" value={form.expiry_date}
            onChange={e => { set('expiry_date', e.target.value); setDateError(''); }} />
          {dateError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{dateError}</span>}
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Recurring</label>
          <select value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
            <option value="none">No</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Notification</label>
          <select value={form.notify_type} onChange={e => set('notify_type', e.target.value)}>
            <option value="none">None</option>
            <option value="email">Email</option>
            <option value="push">Push</option>
          </select>
        </div>
        {form.notify_type !== 'none' && (
          <div style={{ ...fieldStyle, maxWidth: 160 }}>
            <label style={labelStyle}>Days Before</label>
            <input type="number" min="0" max="365" value={form.notify_days_before} onChange={e => set('notify_days_before', parseInt(e.target.value) || 0)} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="submit" style={{ background: 'var(--accent)', color: '#fff' }}>{initial ? 'Update' : 'Add Item'}</button>
        <button type="button" onClick={onCancel} style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>Cancel</button>
      </div>
    </form>
  );
}
