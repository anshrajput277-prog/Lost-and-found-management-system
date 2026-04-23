import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout }) {
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon-wrap">
          <div className="brand-icon">🔍</div>
        </div>
        <div className="brand-text">
          <h1 className="gradient-text">Lost &amp; Found</h1>
          <span>Campus Management Portal</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <span className="user-pill-name">{user?.name || 'Student'}</span>
        </div>
        <button id="logout-btn" className="btn-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, currentUserId, onEdit, onDelete }) {
  const isOwner = item.postedBy?._id === currentUserId;
  const date = new Date(item.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className={`item-card ${item.type.toLowerCase()}`}>
      <div className="item-card-head">
        <h3>{item.itemName}</h3>
        <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
      </div>

      <div className="item-meta">
        <div className="meta-row"><span className="mi">📍</span>{item.location}</div>
        <div className="meta-row"><span className="mi">📅</span>{date}</div>
        <div className="meta-row"><span className="mi">📞</span>{item.contactInfo}</div>
      </div>

      <p className="item-desc">{item.description}</p>

      <div className="item-card-foot">
        <div className="item-poster">
          By <strong>{item.postedBy?.name || 'Unknown'}</strong>
        </div>
        {isOwner && (
          <div className="item-actions">
            <button className="btn btn-icon-sm" onClick={() => onEdit(item)}>✏️ Edit</button>
            <button className="btn btn-danger-sm" onClick={() => onDelete(item._id)}>🗑️ Del</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ item, onClose, onSuccess }) {
  const [form, setForm] = useState({
    itemName: item.itemName || '',
    description: item.description || '',
    type: item.type || 'Lost',
    location: item.location || '',
    contactInfo: item.contactInfo || '',
    date: item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.put(`/items/${item._id}`, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>✏️ Edit Item</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="e-name">Item Name</label>
              <input id="e-name" type="text" name="itemName" value={form.itemName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="e-type">Type</label>
              <select id="e-type" name="type" value={form.type} onChange={handleChange}>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="e-desc">Description</label>
            <textarea id="e-desc" name="description" value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="e-loc">Location</label>
              <input id="e-loc" type="text" name="location" value={form.location} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="e-date">Date</label>
              <input id="e-date" type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="e-contact">Contact Info</label>
            <input id="e-contact" type="text" name="contactInfo" value={form.contactInfo} onChange={handleChange} required />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button
              id="edit-save-btn"
              type="submit"
              className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
              disabled={loading}
            >
              {!loading && '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [searchQ, setSearchQ]     = useState('');
  const [filter, setFilter]       = useState('All');
  const [editItem, setEditItem]   = useState(null);
  const [addError, setAddError]   = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const [form, setForm] = useState({
    itemName: '', description: '', type: 'Lost',
    location: '', contactInfo: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // Fetch
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/items');
      setItems(res.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Search
  const handleSearch = async () => {
    if (!searchQ.trim()) return fetchItems();
    setLoading(true);
    try {
      const res = await api.get(`/items/search?name=${encodeURIComponent(searchQ)}`);
      setItems(res.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const clearSearch = () => { setSearchQ(''); fetchItems(); };

  // Add
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setAddError(''); setAddSuccess('');
  };

  const handleAddSubmit = async e => {
    e.preventDefault();
    const { itemName, description, type, location, contactInfo } = form;
    if (!itemName || !description || !type || !location || !contactInfo)
      return setAddError('All fields are required');

    setAddLoading(true); setAddError(''); setAddSuccess('');
    try {
      await api.post('/items', form);
      setAddSuccess('✅ Item reported successfully!');
      setForm({ itemName: '', description: '', type: 'Lost', location: '', contactInfo: '',
        date: new Date().toISOString().slice(0, 10) });
      fetchItems();
      setTimeout(() => setAddSuccess(''), 3500);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to report item');
    } finally { setAddLoading(false); }
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = filter === 'All' ? items : items.filter(i => i.type === filter);
  const lostCount  = items.filter(i => i.type === 'Lost').length;
  const foundCount = items.filter(i => i.type === 'Found').length;

  return (
    <>
      {/* Animated BG */}
      <div className="bg-aurora" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-noise" />

      <div className="dashboard-page">
        <Navbar user={user} onLogout={handleLogout} />

        <div className="dashboard-body">

          {/* ── LEFT: Add Form ──────────────────────────────────── */}
          <aside>
            <div className="panel">
              <div className="panel-title">
                <div className="panel-title-icon">📋</div>
                Report an Item
              </div>

              {addError   && <div className="alert alert-error"><span>⚠️</span>{addError}</div>}
              {addSuccess && <div className="alert alert-success">{addSuccess}</div>}

              <form onSubmit={handleAddSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="a-name">Item Name</label>
                  <div className="input-wrap">
                    <input id="a-name" type="text" name="itemName" className="with-icon"
                      placeholder="e.g. Blue Nike Backpack"
                      value={form.itemName} onChange={handleFormChange} />
                    <span className="input-icon">📦</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="a-type">Type</label>
                    <select id="a-type" name="type" value={form.type} onChange={handleFormChange}>
                      <option value="Lost">🔴 Lost</option>
                      <option value="Found">🟢 Found</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="a-date">Date</label>
                    <input id="a-date" type="date" name="date" value={form.date} onChange={handleFormChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="a-desc">Description</label>
                  <textarea id="a-desc" name="description"
                    placeholder="Color, brand, identifying features..."
                    value={form.description} onChange={handleFormChange} rows={3} />
                </div>

                <div className="form-group">
                  <label htmlFor="a-loc">Location</label>
                  <div className="input-wrap">
                    <input id="a-loc" type="text" name="location" className="with-icon"
                      placeholder="e.g. Library 2nd Floor"
                      value={form.location} onChange={handleFormChange} />
                    <span className="input-icon">📍</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="a-contact">Contact Info</label>
                  <div className="input-wrap">
                    <input id="a-contact" type="text" name="contactInfo" className="with-icon"
                      placeholder="Phone or email"
                      value={form.contactInfo} onChange={handleFormChange} />
                    <span className="input-icon">📞</span>
                  </div>
                </div>

                <button
                  id="add-item-btn"
                  type="submit"
                  className={`btn btn-primary${addLoading ? ' btn-loading' : ''}`}
                  disabled={addLoading}
                >
                  {!addLoading && '📌 Submit Report'}
                </button>
              </form>
            </div>
          </aside>

          {/* ── RIGHT: Items ────────────────────────────────────── */}
          <main>
            {/* Stats */}
            <div className="stats-row">
              <div className="stat-pill total">📦 {items.length} Total</div>
              <div className="stat-pill lost">🔴 {lostCount} Lost</div>
              <div className="stat-pill found">🟢 {foundCount} Found</div>
            </div>

            {/* Search */}
            <div className="search-wrap">
              <div className="search-field">
                <span className="s-icon">🔍</span>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by name, location, type..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button id="search-btn" className="btn-search" onClick={handleSearch}>Search</button>
              {searchQ && (
                <button className="btn-clear-search" onClick={clearSearch}>✕ Clear</button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              {[
                { label: '📦 All',    val: 'All',   cls: 'active-all'   },
                { label: '🔴 Lost',   val: 'Lost',  cls: 'active-lost'  },
                { label: '🟢 Found',  val: 'Found', cls: 'active-found' },
              ].map(t => (
                <button
                  key={t.val}
                  className={`ftab ${filter === t.val ? t.cls : ''}`}
                  onClick={() => setFilter(t.val)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Section Header */}
            <div className="section-hdr">
              <h2>Reported Items</h2>
              <span className="count-badge">{filtered.length} items</span>
            </div>

            {/* Grid */}
            <div className="items-grid">
              {loading ? (
                <div className="loading-wrap">
                  <div className="spinner-ring" />
                  <p>Loading items...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No items found</h3>
                  <p>
                    {searchQ
                      ? `No results for "${searchQ}". Try a different keyword.`
                      : 'Nothing here yet — be the first to report an item!'}
                  </p>
                </div>
              ) : (
                filtered.map(item => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    currentUserId={user?.id}
                    onEdit={setEditItem}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={() => { setEditItem(null); fetchItems(); }}
        />
      )}
    </>
  );
}
