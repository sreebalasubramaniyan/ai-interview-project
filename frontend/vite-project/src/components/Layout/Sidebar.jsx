import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const [hidden, setHidden] = useState(() => {
    return localStorage.getItem('sidebarHidden') === 'true';
  });
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('sidebarHidden', hidden);
  }, [hidden]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // When sidebar is hidden, show a floating button
  if (hidden) {
    return (
      <button
        className="sidebar-show-btn"
        onClick={() => setHidden(false)}
        title="Show Sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </button>
    );
  }

  return (
    <>
      <div className="sidebar-overlay" onClick={() => setHidden(true)} />
      <aside className="Sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>AI Interview</h2>
          </div>
          <button className="toggle-btn" onClick={() => setHidden(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Overview</div>
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </span>
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            <NavLink to="/admin/questions" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </span>
              <span>Questions</span>
            </NavLink>
            <NavLink to="/admin/interviews" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <span>Interviews</span>
            </NavLink>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Create</div>
            <NavLink to="/admin/questions/new" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </span>
              <span>New Question</span>
            </NavLink>
            <NavLink to="/admin/interviews/new" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="12" y1="9" x2="12" y2="15"/>
                  <line x1="9" y1="12" x2="15" y2="12"/>
                </svg>
              </span>
              <span>Schedule Interview</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{getInitials(admin?.name)}</div>
            <div className="user-info">
              <div className="user-name">{admin?.name || 'Admin'}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
