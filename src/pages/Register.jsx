
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Alert } from '../components/ui';

export default function Register() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  // Step 1: Register and send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.rollNumber
      );

      setOtpSent(true);
      setSuccess('OTP sent successfully. Please check your email.');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await verifyOtp(form.email, otp);

      setSuccess('Email verified successfully!');

      navigate('/student/profile');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await resendOtp(form.email);
      setSuccess('A new OTP has been sent to your email.');
      setOtp('');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form
        className="card auth"
        onSubmit={otpSent ? handleVerifyOtp : handleRegister}
      >
        <h2>
          {otpSent ? 'Verify Your Email' : 'Student Registration'}
        </h2>

        <p className="muted">
          {otpSent
            ? `Enter the OTP sent to ${form.email}`
            : 'Create your account, then verify your email.'}
        </p>

        <Alert error={error} />

        {success && <p className="success">{success}</p>}

        {!otpSent ? (
          <>
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={set('name')}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
              />
            </label>

            <label>
              Roll Number
              <input
                type="text"
                required
                minLength={11}
                maxLength={11}
                value={form.rollNumber}
                onChange={set('rollNumber')}
              />
            </label>

            <label>
              Password (min 6)
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={set('password')}
              />
            </label>

            <button className="btn" disabled={busy}>
              {busy ? 'Sending OTP...' : 'Register & Send OTP'}
            </button>
          </>
        ) : (
          <>
            <label>
              Enter 6-digit OTP
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                minLength={6}
                pattern="[0-9]{6}"
                required
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                placeholder="Enter OTP"
              />
            </label>

            <button className="btn" disabled={busy}>
              {busy ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={handleResendOtp}
            >
              Resend OTP
            </button>

            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setError('');
                setSuccess('');
              }}
            >
              Back to Registration
            </button>
          </>
        )}

        <p className="muted small">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
