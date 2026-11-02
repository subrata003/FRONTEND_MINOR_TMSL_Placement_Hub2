import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { Alert } from '../../components/ui';

const empty = { search: '', department: '', passingYear: '', minCgpa: '', placementStatus: '' };

export default function Students() {
  const [filters, setFilters] = useState(empty);
  const [data, setData] = useState({ students: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = () => {
    const params = Object.fromEntries(Object.entries({ ...filters, page }).filter(([, v]) => v !== ''));
    api.get('/students', { params }).then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  };
  useEffect(load, [page]); // eslint-disable-line

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const apply = (e) => { e.preventDefault(); page === 1 ? load() : setPage(1); };
  const reset = () => { setFilters(empty); setPage(1); setTimeout(load, 0); };

  const remove = async (s) => {
    if (!confirm(`Remove ${s.name} and all their applications?`)) return;
    try { await api.delete(`/students/${s._id}`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h1>Students <span className="muted small">({data.total})</span></h1>
      <Alert error={error} />
      <form className="card filters" onSubmit={apply}>
        <input placeholder="Search name / roll no" value={filters.search} onChange={set('search')} />
        <input placeholder="Department" value={filters.department} onChange={set('department')} />
        <input type="number" placeholder="Passing year" value={filters.passingYear} onChange={set('passingYear')} />
        <input type="number" step="0.1" placeholder="Min CGPA" value={filters.minCgpa} onChange={set('minCgpa')} />
        <select value={filters.placementStatus} onChange={set('placementStatus')}>
          <option value="">All status</option><option>Placed</option><option>Unplaced</option>
        </select>
        <button className="btn">Filter</button>
        <button type="button" className="btn ghost" onClick={reset}>Reset</button>
      </form>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Roll no</th><th>Email</th><th>Dept</th><th>Degree</th><th>Year</th><th>CGPA</th><th>Backlogs</th><th>Resume</th><th>Status</th><th /></tr></thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td><td>{s.rollNumber || '—'}</td><td>{s.user?.email}</td>
                <td>{s.department || '—'}</td><td>{s.degree || '—'}</td><td>{s.passingYear || '—'}</td>
                <td>{s.cgpa ?? '—'}</td><td>{s.backlogs}</td>
                <td>{s.resume ? <a href={s.resume} target="_blank" rel="noreferrer">View</a> : '—'}</td>
                <td><span className={`status ${s.placementStatus.toLowerCase()}`}>{s.placementStatus}</span></td>
                <td><button className="btn danger sm" onClick={() => remove(s)}>Delete</button></td>
              </tr>
            ))}
            {data.students.length === 0 && <tr><td colSpan="11" className="muted">No students found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="row">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span className="muted">Page {data.page} of {data.pages || 1}</span>
        <button className="btn ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </>
  );
}
