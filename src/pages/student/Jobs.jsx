import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../../api';
import { Alert, StatusBadge } from '../../components/ui';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [tab, setTab] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.get('/jobs').then((r) => setJobs(r.data));
  useEffect(() => { load(); }, []);

  const apply = async (job) => {
    try {
      await api.post('/applications', { jobId: job._id });
      setSuccess(`Applied to ${job.title}`); setError(''); load();
    } catch (e) { setError(errMsg(e)); setSuccess(''); }
  };

  const shown = jobs.filter((j) => tab === 'all' || (tab === 'eligible' ? j.eligible : !j.eligible));

  return (
    <>
      <h1>Job Opportunities</h1>
      <Alert error={error} success={success} />
      <div className="row">
        {[['all', 'All'], ['eligible', 'Eligible'], ['ineligible', 'Not eligible']].map(([k, label]) => (
          <button key={k} className={`btn ${tab === k ? '' : 'ghost'}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {shown.map((j) => {
        const e = j.eligibility || {};
        return (
          <div key={j._id} className="card job">
            <div className="row between">
              <div>
                <h3>{j.title}</h3>
                <div className="muted">{j.company?.name}{j.location ? ` · ${j.location}` : ''} · {j.jobType}{j.package ? ` · ${j.package} LPA` : ''}</div>
              </div>
              {j.applicationStatus
                ? <StatusBadge status={j.applicationStatus} />
                : j.eligible
                  ? <span className="status selected">Eligible</span>
                  : <span className="status rejected">Not eligible</span>}
            </div>
            {j.description && <p>{j.description}</p>}
            <div className="small muted">
              Criteria: CGPA ≥ {e.minCgpa} · {e.minPercentage}%+ · backlogs ≤ {e.maxBacklogs}
              {e.degrees?.length ? ` · ${e.degrees.join('/')}` : ''}{e.branches?.length ? ` · ${e.branches.join('/')}` : ''}{e.passingYear ? ` · ${e.passingYear} batch` : ''}
            </div>
            {!j.eligible && <div className="small danger-text">{j.reasons.join(' · ')}</div>}
            <div className="row between">
              <span className={`small ${j.deadlinePassed ? 'danger-text' : 'muted'}`}>Deadline: {fmtDate(j.deadline)}{j.deadlinePassed ? ' (closed)' : ''}</span>
              <button className="btn" disabled={!!j.applicationStatus || !j.eligible || j.deadlinePassed} onClick={() => apply(j)}>
                {j.applicationStatus ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>
        );
      })}
      {shown.length === 0 && <p className="muted">No drives to show.</p>}
    </>
  );
}
