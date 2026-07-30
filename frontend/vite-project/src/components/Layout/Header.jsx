import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };


  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path) => {
    return isActive(path) ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <h1>AI Interview</h1>
        </div>
        <nav className="header-nav">
          <Link to="/admin" className={getLinkClass('/admin')}>
            Dashboard
          </Link>
          <Link to="/admin/questions" className={getLinkClass('/admin/questions')}>
            Questions
          </Link>
          <Link to="/admin/interviews" className={getLinkClass('/admin/interviews')}>
            Interviews
          </Link>
        </nav>
      </div>
      <div className="header-right">
        <span className="header-user-name">{admin?.name || 'Admin'}</span>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </div>
    </header>
  );
}
