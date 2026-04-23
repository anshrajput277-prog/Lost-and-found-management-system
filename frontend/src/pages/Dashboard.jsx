import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

// ─── Navbar Component ────────────────────────────────────────────────────────
function Navbar({ user, onLogout }) {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">🔍</div>
        <div>
          <h1>Lost &amp; Found</h1>
          <span>Campus Item Management</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <span>{user?.name || 'Student'}</span>
        </div>
        <button id="logout-btn" className="btn-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

// ─── Item Card Component ──────────────────────────────────────────────────────
function ItemCard({ item, currentUserId, onEdit, onDelete }) {
  const isOwner = item.postedBy?._id === currentUserId;
  const date = new Date(item.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className={`item-card ${item.type.toLowerCase()}`}>
      <div className="item-card-header">
        <h3>{item.itemName}</h3>
        <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
      </div>

      <div className="item-card-meta">
        <div className="item-meta-row">
          <span className="meta-icon">📍</span>
          <span>{item.location}</span>
        </div>
        <div className="item-meta-row">
          <span className="meta-icon">📅</span>
          <span>{date}</span>
        </div>
        <div className="item-meta-row">
          <span className="meta-icon">📞</span>
          <span>{item.contactInfo}</span>
        </div>
      </div>

      <p className="item-description">{item.description}</p>

      <div className="item-card-footer">
        <div className="item-poster">
          By <span>{item.postedBy?.name || 'Unknown'}</span>
        </div>

        {isOwner && (
          <div className="item-actions">
            <button
              className="btn btn-icon-sm"
              title="Edit item"
              onClick={() => onEdit(item)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-danger-sm"
              title="Delete item"
              onClick={() => onDelete(item._id)}
            >
              🗑️ Del
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Edit Modal Component ─────────────────────────────────────────────────────
function EditModal({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    itemName: item.itemName || '',
    description: item.description || '',
    type: item.type || 'Lost',
    location: item.location || '',
    contactInfo: item.contactInfo || '',
    date: item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/items/${item._id}`, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>✏️ Edit Item</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-itemName">Item Name</label>
              <input
                id="edit-itemName"
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-type">Type</label>
              <select id="edit-type" name="type" value={formData.type} onChange={handleChange}>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-location">Location</label>
              <input
                id="edit-location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-date">Date</label>
              <input
                id="edit-date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-contactInfo">Contact Info</label>
            <input
              id="edit-contactInfo"
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="edit-submit-btn"
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

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [editItem, setEditItem] = useState(null);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const [addForm, setAddForm] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    contactInfo: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // ── Fetch All Items ────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/items');
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Fetch items error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return fetchItems();
    setLoading(true);
    try {
      const res = await api.get(`/items/search?name=${encodeURIComponent(searchQuery)}`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchItems();
  };

  // ── Add Item ───────────────────────────────────────────────────────────────
  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
    setAddError('');
    setAddSuccess('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const { itemName, description, type, location, contactInfo } = addForm;
    if (!itemName || !description || !type || !location || !contactInfo) {
      return setAddError('All fields are required');
    }

    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      await api.post('/items', addForm);
      setAddSuccess('✅ Item reported successfully!');
      setAddForm({
        itemName: '', description: '', type: 'Lost',
        location: '', contactInfo: '',
        date: new Date().toISOString().slice(0, 10),
      });
      fetchItems();
      setTimeout(() => setAddSuccess(''), 3000);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to report item');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Delete Item ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ── Filtered Items ─────────────────────────────────────────────────────────
  const filteredItems = activeFilter === 'All'
    ? items
    : items.filter((item) => item.type === activeFilter);

  const lostCount = items.filter((i) => i.type === 'Lost').length;
  const foundCount = items.filter((i) => i.type === 'Found').length;

  return (
    <div className="dashboard-page">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="dashboard-main">
        {/* ── LEFT PANEL: Add Item Form ──────────────────────────────── */}
        <aside>
          <div className="panel">
            <h2><span className="panel-icon">📋</span> Report an Item</h2>

            {addError && <div className="alert alert-error">⚠️ {addError}</div>}
            {addSuccess && <div className="alert alert-success">{addSuccess}</div>}

            <form onSubmit={handleAddSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="add-itemName">Item Name</label>
                <input
                  id="add-itemName"
                  type="text"
                  name="itemName"
                  placeholder="e.g. Blue Backpack"
                  value={addForm.itemName}
                  onChange={handleAddChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-type">Type</label>
                  <select id="add-type" name="type" value={addForm.type} onChange={handleAddChange}>
                    <option value="Lost">🔴 Lost</option>
                    <option value="Found">🟢 Found</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="add-date">Date</label>
                  <input
                    id="add-date"
                    type="date"
                    name="date"
                    value={addForm.date}
                    onChange={handleAddChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="add-description">Description</label>
                <textarea
                  id="add-description"
                  name="description"
                  placeholder="Brief description (color, brand, special features...)"
                  value={addForm.description}
                  onChange={handleAddChange}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-location">Location</label>
                <input
                  id="add-location"
                  type="text"
                  name="location"
                  placeholder="e.g. Library 2nd Floor"
                  value={addForm.location}
                  onChange={handleAddChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-contactInfo">Contact Info</label>
                <input
                  id="add-contactInfo"
                  type="text"
                  name="contactInfo"
                  placeholder="Phone or email"
                  value={addForm.contactInfo}
                  onChange={handleAddChange}
                />
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

        {/* ── RIGHT PANEL: Items List ────────────────────────────────── */}
        <main>
          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-chip total">
              📦 {items.length} Total
            </div>
            <div className="stat-chip lost">
              🔴 {lostCount} Lost
            </div>
            <div className="stat-chip found">
              🟢 {foundCount} Found
            </div>
          </div>

          {/* Search */}
          <div className="search-bar">
            <input
              id="search-input"
              type="text"
              placeholder="🔍  Search by name, location, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button id="search-btn" onClick={handleSearch}>Search</button>
            {searchQuery && (
              <button className="btn-clear" onClick={handleClearSearch}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {['All', 'Lost', 'Found'].map((tab) => (
              <button
                key={tab}
                className={`filter-tab ${
                  activeFilter === tab
                    ? tab === 'All'
                      ? 'active'
                      : tab === 'Lost'
                      ? 'active-lost'
                      : 'active-found'
                    : ''
                }`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab === 'All' ? '📦 All' : tab === 'Lost' ? '🔴 Lost' : '🟢 Found'}
              </button>
            ))}
          </div>

          {/* Section Header */}
          <div className="section-header">
            <h2>Reported Items</h2>
            <span className="count-badge">{filteredItems.length} items</span>
          </div>

          {/* Items Grid */}
          <div className="items-grid">
            {loading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No items found</h3>
                <p>
                  {searchQuery
                    ? `No results for "${searchQuery}". Try a different search.`
                    : 'No items have been reported yet. Be the first to report one!'}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
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

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            setEditItem(null);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}
