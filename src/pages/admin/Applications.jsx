import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../../api';
import { Alert, Modal, StatusBadge } from '../../components/ui';

const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'];
const CLOSED = ['Selected', 'Rejected', 'Withdrawn'];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ job: '', status: '' });
  const [modal, setModal] = useState(null); // { type: 'interview' | 'result', app }
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    const params = Object.fromEntries(Object.entries(filter).filter(([, v]) => v));
    api.get('/applications', { params }).then((r) => setApps(r.data));
  };
  useEffect(load, [filter]); // eslint-disable-line
  useEffect(() => { api.get('/jobs').then((r) => setJobs(r.data)); }, []);

  const flash = (msg) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 3000); };

  const setStatus = async (app, status) => {
    try { await api.patch(`/applications/${app._id}/status`, { status }); flash(`Marked ${status}`); load(); }
    catch (e) { setError(errMsg(e)); }
  };

  const openModal = (type, app) => {
    setError('');
    setModal({ type, app });
    setForm(type === 'interview'
      ? { roundNumber: 1, roundName: 'Technical Interview', date: '', time: '10:00', mode: 'Online', venue: '' }
      : { status: 'Selected', package: app.job?.package ?? '', remarks: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === 'interview') {
        await api.post('/interviews', { ...form, applicationId: modal.app._id });
        flash('Interview scheduled');
      } else {
        await api.post('/results', { ...form, applicationId: modal.app._id });
        flash(`Result declared: ${form.status}`);
      }
      setModal(null); load();
    } catch (err) { setError(errMsg(err)); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h1>Applications</h1>
      <Alert error={!modal && error} success={success} />
      <div className="card filters">
        <select value={filter.job} onChange={(e) => setFilter({ ...filter, job: e.target.value })}>
          <option value="">All jobs</option>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.company?.name} — {j.title}</option>)}
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Dept</th><th>CGPA</th><th>Backlogs</th><th>Job</th><th>Applied</th><th>Resume</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {apps.map((a) => {
              const done = CLOSED.includes(a.status);
              return (
                <tr key={a._id}>
                  <td>{a.student?.name}<div className="muted small">{a.student?.rollNo}</div></td>
                  <td>{a.student?.department || '—'}</td><td>{a.student?.cgpa ?? '—'}</td><td>{a.student?.backlogs}</td>
                  <td>{a.job?.company?.name}<div className="muted small">{a.job?.title}</div></td>
                  <td>{fmtDate(a.createdAt)}</td>
                  <td>{a.student?.resume ? <a href={a.student.resume} target="_blank" rel="noreferrer">View</a> : '—'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="actions">
                    {!done && a.status === 'Applied' && <button className="btn ghost sm" onClick={() => setStatus(a, 'Under Review')}>Review</button>}
                    {!done && ['Applied', 'Under Review'].includes(a.status) && <button className="btn sm" onClick={() => setStatus(a, 'Shortlisted')}>Shortlist</button>}
                    {!done && ['Shortlisted', 'Interview Scheduled'].includes(a.status) && <button className="btn ghost sm" onClick={() => openModal('interview', a)}>Schedule</button>}
                    {!done && ['Shortlisted', 'Interview Scheduled'].includes(a.status) && <button className="btn sm" onClick={() => openModal('result', a)}>Result</button>}
                    {!done && ['Applied', 'Under Review'].includes(a.status) && <button className="btn danger sm" onClick={() => setStatus(a, 'Rejected')}>Reject</button>}
                  </td>
                </tr>
              );
            })}
            {apps.length === 0 && <tr><td colSpan="9" className="muted">No applications found.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={modal.type === 'interview' ? `Schedule interview — ${modal.app.student?.name}` : `Declare result — ${modal.app.student?.name}`}
          onClose={() => setModal(null)}
        >
          <form className="form two" onSubmit={submit}>
            <div className="full"><Alert error={error} /></div>
            {modal.type === 'interview' ? (
              <>
                <label>Round no.<input type="number" min="1" value={form.roundNumber} onChange={set('roundNumber')} /></label>
                <label>Round name<input value={form.roundName} onChange={set('roundName')} /></label>
                <label>Date *<input type="date" required value={form.date} onChange={set('date')} /></label>
                <label>Time *<input type="time" required value={form.time} onChange={set('time')} /></label>
                <label>Mode<select value={form.mode} onChange={set('mode')}><option>Online</option><option>Offline</option></select></label>
                <label>Venue / meeting link<input value={form.venue} onChange={set('venue')} /></label>
                <button className="btn full">Schedule</button>
              </>
            ) : (
              <>
                <label>Result<select value={form.status} onChange={set('status')}><option>Selected</option><option>Rejected</option></select></label>
                {form.status === 'Selected' && <label>Package (LPA)<input type="number" step="0.1" value={form.package} onChange={set('package')} /></label>}
                <label className="full">Remarks<textarea rows="2" value={form.remarks} onChange={set('remarks')} /></label>
                <button className="btn full">Declare result</button>
              </>
            )}
          </form>
        </Modal>
      )}
    </>
  );
}
