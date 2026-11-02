import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../../api';
import { Alert } from '../../components/ui';

export default function Interviews() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = () => api.get('/interviews').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const cancel = async (i) => {
    if (!confirm('Cancel this interview?')) return;
    try { await api.delete(`/interviews/${i._id}`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h1>Interview Schedule</h1>
      <Alert error={error} />
      <p className="muted">Schedule new rounds from the Applications page (shortlisted candidates only).</p>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Student</th><th>Company / Role</th><th>Round</th><th>Mode</th><th>Venue / link</th><th /></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id}>
                <td>{fmtDate(i.date)}</td><td>{i.time}</td>
                <td>{i.student?.name}<div className="muted small">{i.student?.rollNo}</div></td>
                <td>{i.job?.company?.name}<div className="muted small">{i.job?.title}</div></td>
                <td>#{i.roundNumber} {i.roundName}</td><td>{i.mode}</td><td>{i.venue || '—'}</td>
                <td><button className="btn danger sm" onClick={() => cancel(i)}>Cancel</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="8" className="muted">No interviews scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
