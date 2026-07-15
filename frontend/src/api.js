const BASE = '/api';

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function fetchItems() {
  try {
    const res = await fetch(`${BASE}/items`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch items');
    const items = await res.json();
    try { localStorage.setItem('exspire_items_cache', JSON.stringify(items)); } catch (_) {}
    return { items, offline: false };
  } catch (err) {
    const cached = localStorage.getItem('exspire_items_cache');
    if (cached) {
      return { items: JSON.parse(cached), offline: true };
    }
    throw err;
  }
}

export async function createItem(data) {
  const res = await fetch(`${BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create item');
  return res.json();
}

export async function updateItem(id, data) {
  const res = await fetch(`${BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update item');
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${BASE}/items/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete item');
  return res.json();
}

export async function sendTestNotification(email) {
  const res = await fetch(`${BASE}/test-notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send test notification');
  }
  return res.json();
}

export async function getVapidKey() {
  const res = await fetch(`${BASE}/push/vapid-key`, { credentials: 'include' });
  if (!res.ok) throw new Error('Push not configured');
  return res.json();
}

export async function subscribePush(subscription) {
  const res = await fetch(`${BASE}/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subscription }),
  });
  if (!res.ok) throw new Error('Failed to subscribe');
  return res.json();
}

export async function unsubscribePush(endpoint) {
  const res = await fetch(`${BASE}/push/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) throw new Error('Failed to unsubscribe');
  return res.json();
}

export async function testPush() {
  const res = await fetch(`${BASE}/push/test`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send test push');
  }
  return res.json();
}

// --- Admin API ---

export async function fetchAdminUsers() {
  const res = await fetch(`${BASE}/admin/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchAdminUserItems(userId) {
  const res = await fetch(`${BASE}/admin/users/${userId}/items`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch user items');
  return res.json();
}
