import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../../api';
import { Alert, StatusBadge } from '../../components/ui';

const STEPS = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];
const CLOSED = ['Selected', 'Rejected', 'Withdrawn'];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');
  const load = () => api.get('/applications/my').then((r) => setApps(r.data));
  useEffect(() => { load(); }, []);

  const withdraw = async (a) => {
    if (!confirm('Withdraw this application?')) return;
    try { await api.patch(`/applications/${a._id}/withdraw`); setError(''); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h1>My Applications</h1>
      <Alert error={error} />
      {apps.length === 0 && <p className="muted">You have not applied to any drive yet.</p>}
      {apps.map((a) => {
        const idx = STEPS.indexOf(a.status);
        return (
          <div key={a._id} className="card">
            <div className="row between">
              <div>
                <h3>{a.job?.title}</h3>
                <div className="muted">{a.job?.company?.name} · Applied {fmtDate(a.createdAt)}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div key={s} className={`step ${idx >= i ? 'done' : ''}`}><span>{i + 1}</span>{s}</div>
              ))}
            </div>
            {a.history?.length > 0 && (
              <div className="muted small">
                {a.history.map((h, i) => <span key={i}>{h.status} ({fmtDate(h.at)}){i < a.history.length - 1 ? ' → ' : ''}</span>)}
              </div>
            )}
            {!CLOSED.includes(a.status) && <button className="btn danger sm" onClick={() => withdraw(a)}>Withdraw</button>}
          </div>
        );
      })}
    </>
  );
}
