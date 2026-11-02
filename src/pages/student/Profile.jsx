import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { Alert } from '../../components/ui';

const FIELDS = [
  ['name', 'Full name', 'text'], ['rollNumber', 'Roll number', 'text'], ['phone', 'Phone', 'tel'],
  ['department', 'Department / Branch (e.g. CSE)', 'text'], ['degree', 'Degree (e.g. B.Tech)', 'text'],
  ['passingYear', 'Passing year', 'number'], ['cgpa', 'CGPA (0-10)', 'number'], ['percentage', 'Current percentage', 'number'],
  ['tenthPercentage', '10th percentage', 'number'], ['twelfthPercentage', '12th percentage', 'number'], ['backlogs', 'Active backlogs', 'number'],
];

export default function Profile() {
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { api.get('/students/me').then((r) => setP(r.data)); }, []);
  if (!p) return <p className="muted">Loading…</p>;

  const flash = (m) => { setSuccess(m); setError(''); setTimeout(() => setSuccess(''), 3000); };
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/students/me', p);
      setP(data); flash('Profile saved');
    } catch (err) { setError(errMsg(err)); }
  };

  const uploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const { data } = await api.post('/students/me/resume', fd);
      setP(data); flash('Resume uploaded');
    } catch (err) { setError(errMsg(err)); }
    e.target.value = '';
  };

  return (
    <>
      <h1>My Profile</h1>
      <Alert error={error} success={success} />
      <div className="card">
        <div className="row between"><strong>Profile completion</strong><span>{p.profileCompletion}%</span></div>
        <div className="progress"><div style={{ width: `${p.profileCompletion}%` }} /></div>
        <p className="muted small">Email: {p.user?.email}</p>
      </div>

      <form className="card form two" onSubmit={save}>
        {FIELDS.map(([k, label, type]) => (
          <label key={k}>{label}
            <input type={type} step={k === 'cgpa' ? '0.01' : undefined} min={type === 'number' ? 0 : undefined}
              required={k === 'name'} value={p[k] ?? ''} onChange={set(k)} />
          </label>
        ))}
        <button className="btn full">Save profile</button>
      </form>

      <div className="card">
        <h3>Resume (PDF, max 2 MB)</h3>
        {p.resume
          ? <p>Current resume: <a href={p.resume} target="_blank" rel="noreferrer">View / download</a></p>
          : <p className="muted">No resume uploaded yet.</p>}
        <input type="file" accept="application/pdf" onChange={uploadResume} />
      </div>
    </>
  );
}
