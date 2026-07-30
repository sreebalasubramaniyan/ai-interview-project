import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import './AdminLayout.css';

export default function AdminLayout() {
  const { admin } = useAuth();

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-content">
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
