import { useEffect, useState } from 'react';
import api from '../../api';
import { Stat, StatusBadge } from '../../components/ui';

const lpa = (n) => (n ? `${Number(n).toFixed(2)} LPA` : '—');

export default function Reports() {
  const [rep, setRep] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/dashboard/reports').then((r) => setRep(r.data));
    api.get('/results').then((r) => setResults(r.data));
  }, []);
  if (!rep) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Reports &amp; Results</h1>
      <div className="grid">
        <Stat label="Highest package" value={lpa(rep.packageStats.highest)} />
        <Stat label="Average package" value={lpa(rep.packageStats.average)} />
        <Stat label="Lowest package" value={lpa(rep.packageStats.lowest)} />
      </div>

      <div className="two-col">
        <div className="card table-wrap">
          <h3>Department-wise placement</h3>
          <table>
            <thead><tr><th>Department</th><th>Students</th><th>Placed</th><th>%</th></tr></thead>
            <tbody>
              {rep.byDepartment.map((d) => (
                <tr key={d._id}><td>{d._id}</td><td>{d.total}</td><td>{d.placed}</td><td>{d.total ? Math.round((d.placed / d.total) * 100) : 0}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card table-wrap">
          <h3>Company-wise selections</h3>
          <table>
            <thead><tr><th>Company</th><th>Selected</th><th>Avg package</th></tr></thead>
            <tbody>
              {rep.byCompany.map((c) => <tr key={c._id}><td>{c._id}</td><td>{c.selected}</td><td>{lpa(c.avgPackage)}</td></tr>)}
              {rep.byCompany.length === 0 && <tr><td colSpan="3" className="muted">No selections yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card table-wrap">
        <h3>Declared results</h3>
        <table>
          <thead><tr><th>Student</th><th>Dept</th><th>Company</th><th>Role</th><th>Result</th><th>Package</th><th>Remarks</th></tr></thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.student?.name}<div className="muted small">{r.student?.rollNo}</div></td>
                <td>{r.student?.department || '—'}</td><td>{r.job?.company?.name}</td><td>{r.job?.title}</td>
                <td><StatusBadge status={r.status} /></td><td>{lpa(r.package)}</td><td>{r.remarks || '—'}</td>
              </tr>
            ))}
            {results.length === 0 && <tr><td colSpan="7" className="muted">No results declared yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
