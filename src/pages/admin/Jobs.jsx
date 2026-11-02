import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../../api';
import { Alert, Modal } from '../../components/ui';

const blank = {
  company: 'tcs', title: '', description: '', jobType: 'Full-time', location: '', package: '', deadline: '', status: 'Open',
  minCgpa: 6, minPercentage: 60, maxBacklogs: 0, degrees: '', branches: '', passingYear: '',
};

const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

// flatten a job from the API into the form shape
const toForm = (j) => ({
  _id: j._id, company: j.company?._id || j.company, title: j.title, description: j.description || '',
  jobType: j.jobType, location: j.location || '', package: j.package ?? '', status: j.status,
  deadline: j.deadline ? j.deadline.slice(0, 10) : '',
  minCgpa: j.eligibility?.minCgpa ?? 0, minPercentage: j.eligibility?.minPercentage ?? 0,
  maxBacklogs: j.eligibility?.maxBacklogs ?? 0,
  degrees: (j.eligibility?.degrees || []).join(', '), branches: (j.eligibility?.branches || []).join(', '),
  passingYear: j.eligibility?.passingYear ?? '',
});

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/jobs').then((r) => setJobs(r.data));
  useEffect(() => { load(); api.get('/companies').then((r) => setCompanies(r.data)); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const body = {
      company: form.company, title: form.title, description: form.description, jobType: form.jobType,
      location: form.location, package: form.package === '' ? undefined : Number(form.package),
      deadline: form.deadline, status: form.status,
      eligibility: {
        minCgpa: Number(form.minCgpa) || 0, minPercentage: Number(form.minPercentage) || 0,
        maxBacklogs: Number(form.maxBacklogs) || 0, degrees: list(form.degrees), branches: list(form.branches),
        passingYear: form.passingYear === '' ? undefined : Number(form.passingYear),
      },
    };
    try {
      form._id ? await api.put(`/jobs/${form._id}`, body) : await api.post('/jobs', body);
      setForm(null); setError(''); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const remove = async (j) => {
    if (!confirm(`Delete "${j.title}"?`)) return;
    try { await api.delete(`/jobs/${j._id}`); setError(''); load(); } catch (e) { setError(errMsg(e)); }
  };

  const toggle = async (j) => {
    await api.put(`/jobs/${j._id}`, { status: j.status === 'Open' ? 'Closed' : 'Open' });
    load();
  };

  return (
    <>
      <div className="row between">
        <h1>Jobs &amp; Eligibility</h1>
        <button className="btn" disabled={!companies.length} onClick={() => setForm({ ...blank, company: companies[0]?._id })}>+ Create job</button>
      </div>
      {!companies.length && <p className="muted">Add a company first.</p>}
      <Alert error={!form && error} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Company</th><th>Role</th><th>Package</th><th>Eligibility</th><th>Deadline</th><th>Applicants</th><th>Status</th><th /></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j._id}>
                <td>{j.company?.name}</td><td>{j.title}<div className="muted small">{j.jobType}</div></td>
                <td>{j.package ? `${j.package} LPA` : '—'}</td>
                <td className="small">
                  CGPA ≥ {j.eligibility?.minCgpa} · {j.eligibility?.minPercentage}% · backlogs ≤ {j.eligibility?.maxBacklogs}
                  {j.eligibility?.degrees?.length > 0 && <div>{j.eligibility.degrees.join(', ')}</div>}
                  {j.eligibility?.branches?.length > 0 && <div>{j.eligibility.branches.join(', ')}</div>}
                  {j.eligibility?.passingYear && <div>Batch {j.eligibility.passingYear}</div>}
                </td>
                <td>{fmtDate(j.deadline)}</td><td>{j.applicationCount}</td>
                <td><span className={`status ${j.status.toLowerCase()}`}>{j.status}</span></td>
                <td className="actions">
                  <button className="btn ghost sm" onClick={() => setForm(toForm(j))}>Edit</button>
                  <button className="btn ghost sm" onClick={() => toggle(j)}>{j.status === 'Open' ? 'Close' : 'Reopen'}</button>
                  <button className="btn danger sm" onClick={() => remove(j)}>Delete</button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan="8" className="muted">No jobs yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form._id ? 'Edit job' : 'Create job'} onClose={() => { setForm(null); setError(''); }}>
          <form className="form two" onSubmit={save}>
            <div className="full"><Alert error={error} /></div>
            <label>Company *
              <select required value={form.company} onChange={set('company')}>
                {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label>Job title *<input required value={form.title} onChange={set('title')} /></label>
            <label>Type
              <select value={form.jobType} onChange={set('jobType')}><option>Full-time</option><option>Internship</option><option>Internship + PPO</option></select>
            </label>
            <label>Location<input value={form.location} onChange={set('location')} /></label>
            <label>Package (LPA)<input type="number" step="0.1" min="0" value={form.package} onChange={set('package')} /></label>
            <label>Application deadline *<input type="date" required value={form.deadline} onChange={set('deadline')} /></label>
            <label className="full">Description<textarea rows="3" value={form.description} onChange={set('description')} /></label>

            <h4 className="full">Eligibility criteria</h4>
            <label>Min CGPA<input type="number" step="0.1" min="0" max="10" value={form.minCgpa} onChange={set('minCgpa')} /></label>
            <label>Min percentage<input type="number" min="0" max="100" value={form.minPercentage} onChange={set('minPercentage')} /></label>
            <label>Max backlogs<input type="number" min="0" value={form.maxBacklogs} onChange={set('maxBacklogs')} /></label>
            <label>Passing year (blank = any)<input type="number" value={form.passingYear} onChange={set('passingYear')} /></label>
            <label>Degrees (comma separated)<input placeholder="B.Tech, MCA" value={form.degrees} onChange={set('degrees')} /></label>
            <label>Branches (comma separated)<input placeholder="CSE, IT, ECE" value={form.branches} onChange={set('branches')} /></label>
            <button className="btn full">Save job</button>
          </form>
        </Modal>
      )}
    </>
  );
}
