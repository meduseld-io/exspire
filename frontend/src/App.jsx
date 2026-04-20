import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchItems, createItem, updateItem, deleteItem, sendTestNotification, getVapidKey, subscribePush, unsubscribePush, testPush, getMe, sendVerification, changePassword, deleteAccount } from './api.js';
import ItemForm from './ItemForm.jsx';
import ItemList, { categoryColors } from './ItemList.jsx';
import AuthPage from './AuthPage.jsx';
import AdminPanel from './AdminPanel.jsx';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function getTheme() {
  return localStorage.getItem('exspire_theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('exspire_theme', theme);
}

function SettingsModal({ settings, onSave, onClose, addToast, user, onLogout, theme, setTheme }) {
  const [email, setEmail] = useState(settings.email || user?.email || '');
  const [pushEnabled, setPushEnabled] = useState(settings.pushEnabled || false);
  const [pushLoading, setPushLoading] = useState(false);
  const [spireAlign, setTowerAlign] = useState(settings.spireAlign || 'center');
  const [showRecurring, setShowRecurring] = useState(settings.showRecurring ?? false);
  // Change password
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  // Delete account
  const [showDeleteAcct, setShowDeleteAcct] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      addToast('Password changed');
      setShowChangePw(false);
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      console.error('Failed to change password:', err);
      addToast(err.message, 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAcct = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePw);
      addToast('Account deleted');
      onLogout();
    } catch (err) {
      console.error('Failed to delete account:', err);
      addToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...settings, email, pushEnabled, spireAlign, showRecurring });
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="settings-profile">
          <span className="profile-avatar profile-avatar--lg">{user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}</span>
          <div>
            <div className="settings-name">{user?.displayName || 'User'}</div>
            <div className="settings-sub">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <span className="settings-section-title">Appearance</span>
            <div className="settings-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="settings-label">{theme === 'dark' ? '🌙' : '☀️'} Theme</label>
                <button
                  type="button"
                  className={`toggle-btn ${theme === 'light' ? 'toggle-btn--on' : ''}`}
                  onClick={() => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); applyTheme(t); }}
                >
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>
            <div className="settings-field" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="settings-label">📐 Tower alignment</label>
                <div className="align-toggle">
                  {['left', 'center', 'right'].map(a => (
                    <button key={a} type="button" className={`align-btn ${spireAlign === a ? 'align-btn--active' : ''}`} onClick={() => setTowerAlign(a)}>
                      {a === 'left' ? '◧' : a === 'center' ? '◫' : '◨'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="settings-field" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="settings-label">🔄 Show recurring items</label>
                <button
                  type="button"
                  className={`toggle-btn ${showRecurring ? 'toggle-btn--on' : ''}`}
                  onClick={() => setShowRecurring(!showRecurring)}
                >
                  {showRecurring ? 'On' : 'Off'}
                </button>
              </div>
              <span className="settings-hint">When off, recurring items are hidden from the spire</span>
            </div>
          </div>

          <div className="settings-section">
            <span className="settings-section-title">Integrations</span>
            <div className="settings-field">
              <label className="settings-label">📧 Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <span className="settings-hint">Used when items have email notifications enabled</span>
            </div>
            <div className="settings-field" style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="settings-label">🔔 Push notifications</label>
                <button type="button" className={`toggle-btn ${pushEnabled ? 'toggle-btn--on' : ''}`} onClick={handlePushToggle} disabled={pushLoading}>
                  {pushLoading ? '…' : (pushEnabled ? 'On' : 'Off')}
                </button>
              </div>
              <span className="settings-hint">Browser push notifications for expiring items</span>
            </div>
          </div>

          <div className="settings-section">
            <span className="settings-section-title">Account</span>
            {!showChangePw ? (
              <button type="button" className="btn-test" style={{ width: '100%' }} onClick={() => setShowChangePw(true)}>
                🔒 Change password
              </button>
            ) : (
              <div className="settings-inline-form">
                <input type="password" placeholder="Current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                <input type="password" placeholder="New password (min 6)" minLength={6} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={() => { setShowChangePw(false); setCurrentPw(''); setNewPw(''); }}>Cancel</button>
                  <button type="button" className="btn-primary" style={{ flex: 1 }} disabled={pwLoading || !currentPw || newPw.length < 6} onClick={handleChangePw}>
                    {pwLoading ? '…' : 'Update'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: '0.75rem' }}>
              {!showDeleteAcct ? (
                <button type="button" className="btn-danger" style={{ width: '100%', opacity: 0.8 }} onClick={() => setShowDeleteAcct(true)}>
                  🗑️ Delete account
                </button>
              ) : (
                <div className="settings-inline-form">
                  <p style={{ fontSize: '0.8rem', color: 'var(--danger)', margin: '0 0 0.5rem' }}>This will permanently delete your account and all items. Enter your password to confirm.</p>
                  <input type="password" placeholder="Your password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={() => { setShowDeleteAcct(false); setDeletePw(''); }}>Cancel</button>
                    <button type="button" className="btn-danger" style={{ flex: 1 }} disabled={deleteLoading || !deletePw} onClick={handleDeleteAcct}>
                      {deleteLoading ? '…' : 'Delete forever'}
                    </button>
                  </div>
                </div>
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
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testDropdownOpen, setTestDropdownOpen] = useState(false);
  const testDropdownRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [exitingId, setExitingId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const profileRef = useRef(null);
  const [theme, setTheme] = useState(getTheme);
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('exspire_settings') || '{}'); }
    catch (e) { console.error('Failed to parse settings from localStorage:', e); return {}; }
  });

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullRef = useRef({ startY: 0, pulling: false });

  // Show install banner on mobile web (not standalone PWA)
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const dismissed = localStorage.getItem('exspire_install_dismissed');
    if (!isStandalone && !dismissed && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setShowInstallBanner(true);
    }
  }, []);

  // Apply saved theme only when logged in; auth page always uses dark
  useEffect(() => {
    if (user) {
      applyTheme(theme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [user, theme]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  // Close test dropdown on outside click
  useEffect(() => {
    if (!testDropdownOpen) return;
    const handleClick = (e) => {
      if (testDropdownRef.current && !testDropdownRef.current.contains(e.target)) setTestDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [testDropdownOpen]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('exspire_token');
    if (!token) { setAuthChecked(true); return; }
    getMe()
      .then(u => setUser(u))
      .catch(err => { console.error('Session check failed:', err); localStorage.removeItem('exspire_token'); })
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('exspire_token');
    document.documentElement.setAttribute('data-theme', 'dark');
    setUser(null);
    setItems([]);
  };

  const load = async () => {
    setItemsLoading(true);
    try { setItems(await fetchItems()); }
    catch (err) { console.error('Failed to load items:', err); addToast('Could not load items', 'error'); }
    finally { setItemsLoading(false); }
  };

  useEffect(() => { if (user) load(); }, [user]);

  // Auto-populate settings email from user's login email if not set
  useEffect(() => {
    if (user && !settings.email) {
      const updated = { ...settings, email: user.email };
      setSettings(updated);
      localStorage.setItem('exspire_settings', JSON.stringify(updated));
    }
  }, [user]);

  // Pull-to-refresh handlers
  const handlePullStart = (e) => {
    if (window.scrollY === 0 && !refreshing) {
      pullRef.current = { startY: e.touches[0].clientY, pulling: false };
    }
  };

  const handlePullMove = (e) => {
    if (refreshing || !pullRef.current.startY) return;
    const dy = e.touches[0].clientY - pullRef.current.startY;
    if (dy > 10 && window.scrollY === 0) {
      pullRef.current.pulling = true;
      setPullDistance(Math.min(dy * 0.4, 100));
    }
  };

  const handlePullEnd = async () => {
    if (pullDistance > 80 && !refreshing) {
      setRefreshing(true);
      setPullDistance(60);
      await load();
      setRefreshing(false);
    }
    setPullDistance(0);
    pullRef.current = { startY: 0, pulling: false };
  };

  const handleSave = async (data) => {
    try {
      if (editing) { await updateItem(editing.id, data); addToast('Item updated'); }
      else { await createItem(data); addToast('Item added'); }
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) { console.error('Failed to save item:', err); addToast('Could not save item', 'error'); }
  };

  const handleDeleteRequest = (id) => {
    const item = items.find(i => i.id === id);
    setDeleteConfirm({ id, name: item?.name || 'this item' });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const idToDelete = deleteConfirm.id;
    setDeleteConfirm(null);
    setExitingId(idToDelete);
    try {
      await deleteItem(idToDelete);
      addToast('Item deleted');
      // Wait for exit animation to finish before removing from state
      setTimeout(() => {
        setExitingId(null);
        setItems(prev => prev.filter(i => i.id !== idToDelete));
      }, 250);
    }
    catch (err) {
      console.error('Failed to delete item:', err);
      addToast('Could not delete item', 'error');
      setExitingId(null);
    }
  };

  const handleEdit = (item) => { setEditing(item); setShowForm(false); };
  const handleCancel = () => { setEditing(null); setShowForm(false); };

  const handleTestNotification = async () => {
    setTestSending(true);
    setTestDropdownOpen(false);
    try { await sendTestNotification(settings.email || user?.email); addToast('Test email sent'); }
    catch (err) { console.error('Failed to send test notification:', err); addToast(err.message, 'error'); }
    finally { setTestSending(false); }
  };

  const handleTestPush = async () => {
    setTestSending(true);
    setTestDropdownOpen(false);
    try { await testPush(); addToast('Test push sent'); }
    catch (err) { console.error('Failed to send test push:', err); addToast(err.message, 'error'); }
    finally { setTestSending(false); }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('exspire_settings', JSON.stringify(newSettings));
    setShowSettings(false);
    addToast('Settings saved');
  };

  const showRecurringPref = settings.showRecurring ?? false;
  const baseItems = showRecurringPref ? items : items.filter(i => !i.recurrence || i.recurrence === 'none');
  const searchFiltered = searchQuery ? baseItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())) : baseItems;
  const categoryCount = (cat) => searchFiltered.filter(i => i.category === cat).length;
  const allCategories = [...new Set(baseItems.map(i => i.category))].sort();
  const filteredItems = filter === 'all' ? searchFiltered : searchFiltered.filter(i => i.category === filter);

  if (!authChecked) return (
    <div className="loading-screen">
      <img src="/logo.png" alt="ExSpire" style={{ height: 48 }} />
      <div className="spinner" />
    </div>
  );

  if (!user) return (
    <div className="auth-transition auth-transition--in">
      <AuthPage onAuth={setUser} />
    </div>
  );

  return (
    <>
    {/* Pull-to-refresh indicator — above app container */}
    {(pullDistance > 0 || refreshing) && (
      <div className="pull-indicator" style={{ height: pullDistance }}>
        <div className={`spinner spinner--sm ${refreshing ? '' : 'spinner--paused'}`} style={{ opacity: Math.min(pullDistance / 50, 1) }} />
      </div>
    )}
    <div
      className="app-container auth-transition auth-transition--in"
      onTouchStart={handlePullStart}
      onTouchMove={handlePullMove}
      onTouchEnd={handlePullEnd}
    >
      {/* Pull-to-refresh indicator removed from here */}

      {!user.emailVerified && (
        <div className="verify-banner">
          <span>📧 Please verify your email address.</span>
          <button className="btn-test" id="verify-btn" onClick={async (e) => {
            const btn = e.currentTarget;
            btn.disabled = true;
            btn.textContent = 'Sending…';
            try {
              await sendVerification();
              addToast('Verification email sent — check your inbox');
              btn.textContent = 'Sent ✓';
              setTimeout(() => { btn.textContent = 'Resend'; btn.disabled = false; }, 5000);
            } catch (err) {
              console.error('Failed to send verification email:', err);
              addToast(err.message, 'error');
              btn.textContent = 'Send verification';
              btn.disabled = false;
            }
          }}>Send verification</button>
        </div>
      )}

      {showInstallBanner && (
        <div className="install-banner">
          <span>📲 Add ExSpire to your homescreen for the best experience</span>
          <button className="btn-icon" onClick={() => { setShowInstallBanner(false); localStorage.setItem('exspire_install_dismissed', '1'); }}>✕</button>
        </div>
      )}
      <header className="app-header">
        <div className="app-logo-group">
          <img src="/logo.png" alt="ExSpire" className="app-logo" />
          <span className="app-title">ExSpire</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!showForm && !showAdmin && (
            <>
              {searchOpen ? (
                <div className="search-inline">
                  <input type="text" className="search-input" placeholder="Search items…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                  <button className="btn-icon" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>✕</button>
                </div>
              ) : (
                <button className="btn-icon" onClick={() => setSearchOpen(true)}>⌕</button>
              )}
              {user?.isAdmin && (
                <div className="profile-wrapper" ref={testDropdownRef}>
                  <button className="btn-test" onClick={() => setTestDropdownOpen(!testDropdownOpen)} disabled={testSending}>
                    {testSending ? '…' : '🧪 Test'}
                  </button>
                  {testDropdownOpen && (
                    <div className="profile-dropdown">
                      <button className="profile-dropdown-item" onClick={handleTestNotification}>📧 Test Email</button>
                      <button className="profile-dropdown-item" onClick={handleTestPush}>🔔 Test Push</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <div className="profile-wrapper" ref={profileRef}>
            <button className="btn-profile" onClick={() => setProfileOpen(!profileOpen)}>
              <span className="profile-avatar">{user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}</span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-info">
                  <span className="profile-dropdown-name">{user?.displayName || 'User'}</span>
                  <span className="profile-dropdown-email">{user?.email}</span>
                </div>
                <div className="profile-dropdown-divider" />
                {user?.isAdmin && (
                  <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); setShowAdmin(true); }}>
                    🛡️ Admin Panel
                  </button>
                )}
                <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); setShowSettings(true); }}>
                  ⚙️ Settings
                </button>
                <button className="profile-dropdown-item profile-dropdown-item--danger" onClick={() => { setProfileOpen(false); handleLogout(); }}>
                  ↪ Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showForm && <ItemForm initial={editing} onSave={handleSave} onCancel={handleCancel} />}

      {showAdmin && !showForm && (
        <AdminPanel onBack={() => setShowAdmin(false)} addToast={addToast} />
      )}

      {!showForm && !showAdmin && (
        <>
          <div className="filter-bar filter-bar--desktop">
            <button className={`filter-chip ${filter === 'all' ? 'filter-chip--active' : ''}`} onClick={() => setFilter('all')}>
              All <span className="filter-count">{searchFiltered.length}</span>
            </button>
            {allCategories.map(cat => {
              const count = categoryCount(cat);
              const catColor = categoryColors[cat] || categoryColors.other;
              const isActive = filter === cat;
              return (
                <button key={cat} className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`}
                  style={isActive ? { background: catColor, borderColor: catColor } : undefined}
                  onClick={() => setFilter(cat)}>
                  {cat} <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="filter-bar filter-bar--mobile">
            <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}
              style={filter !== 'all' ? { borderColor: categoryColors[filter] || categoryColors.other } : undefined}>
              <option value="all">All ({searchFiltered.length})</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat} ({categoryCount(cat)})</option>)}
            </select>
          </div>
        </>
      )}

      {!showAdmin && <ItemList items={filteredItems} onEdit={handleEdit} onDelete={handleDeleteRequest} loading={itemsLoading} align={settings.spireAlign || 'center'} editing={editing} onSave={handleSave} onCancel={handleCancel} exitingId={exitingId} />}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} <a href="https://github.com/meduseld-io" target="_blank" rel="noopener noreferrer">meduseld.io</a></p>
      </footer>
    </div>

    {!showForm && !showAdmin && (
      <button className="btn-fab" onClick={() => { setEditing(null); setShowForm(true); }} aria-label="Add item">+</button>
    )}

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

    {showSettings && <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} addToast={addToast} user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} />}

    <div className="toast-container">
      {toasts.map(t => <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>)}
    </div>
  </>
  );
}
