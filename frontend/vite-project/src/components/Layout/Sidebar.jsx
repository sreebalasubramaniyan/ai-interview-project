import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>AI Interview</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/questions" className={({ isActive }) => isActive ? 'active' : ''}>
          Questions
        </NavLink>
        <NavLink to="/admin/questions/new" className={({ isActive }) => isActive ? 'active' : ''}>
          New Question
        </NavLink>
        <NavLink to="/admin/interviews" className={({ isActive }) => isActive ? 'active' : ''}>
          Interviews
        </NavLink>
        <NavLink to="/admin/interviews/new" className={({ isActive }) => isActive ? 'active' : ''}>
          Schedule Interview
        </NavLink>
      </nav>
    </aside>
  );
}