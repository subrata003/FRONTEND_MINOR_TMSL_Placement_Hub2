import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './pages/Notifications';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import AdminApplications from './pages/admin/Applications';
import AdminInterviews from './pages/admin/Interviews';
import AdminReports from './pages/admin/Reports';

import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentJobs from './pages/student/Jobs';
import StudentApplications from './pages/student/Applications';
import StudentInterviews from './pages/student/Interviews';

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center">Loading…</div>;
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<Protected role="admin"><Layout role="admin" /></Protected>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="interviews" element={<AdminInterviews />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/student" element={<Protected role="student"><Layout role="student" /></Protected>}>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="interviews" element={<StudentInterviews />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
