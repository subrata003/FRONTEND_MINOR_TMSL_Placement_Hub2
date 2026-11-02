import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Alert } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await register(form.name, form.email, form.password, form.rollNumber);
      navigate('/student/profile');
    } catch (err) {
      setError(errMsg(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit}>
        <h2>Student Registration</h2>
        <p className="muted">Create your account, then complete your profile.</p>
        <Alert error={error} />
        <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>rollNumber<input type="text" required minLength={11} value={form.rollNumber} onChange={set('rollNumber')} /></label>
        <label>Password (min 6)<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
        <p className="muted small">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
