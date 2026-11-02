import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const LINKS = {
  admin: [
    ['/admin', 'Dashboard'],
    ['/admin/students', 'Students'],
    ['/admin/companies', 'Companies'],
    ['/admin/jobs', 'Jobs & Eligibility'],
    ['/admin/applications', 'Applications'],
    ['/admin/interviews', 'Interviews'],
    ['/admin/reports', 'Reports & Results'],
    ['/admin/notifications', 'Notifications'],
  ],
  student: [
    ['/student', 'Dashboard'],
    ['/student/profile', 'My Profile & Resume'],
    ['/student/jobs', 'Job Opportunities'],
    ['/student/applications', 'My Applications'],
    ['/student/interviews', 'Interviews & Results'],
    ['/student/notifications', 'Notifications'],
  ],
};

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get('/notifications').then((r) => setUnread(r.data.unread)).catch(() => {});
  }, [location.pathname]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <h2>Placement<br />Portal</h2>
        <small className="muted">{role === 'admin' ? 'Admin Panel' : 'Student Panel'}</small>
        <nav>
          {LINKS[role].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === `/${role}`}>
              {label}
              {label === 'Notifications' && unread > 0 && <span className="badge">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="muted small">{user.email}</div>
          <button className="btn ghost" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}
