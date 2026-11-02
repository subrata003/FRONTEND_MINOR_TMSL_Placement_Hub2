import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Stat, StatusBadge } from '../../components/ui';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/dashboard/student').then((r) => setS(r.data)); }, []);
  if (!s) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Student Dashboard</h1>
      {s.placementStatus === 'Placed' && (
        <div className="alert success">🎉 You are placed{s.placedCompany ? ` at ${s.placedCompany}` : ''}. Congratulations!</div>
      )}
      <div className="card">
        <div className="row between"><strong>Profile completion</strong><span>{s.profileCompletion}%</span></div>
        <div className="progress"><div style={{ width: `${s.profileCompletion}%` }} /></div>
        {s.profileCompletion < 100 && <p className="muted small">Complete your <Link to="/student/profile">profile and upload your resume</Link> to apply for jobs.</p>}
      </div>
      <div className="grid">
        <Stat label="Open drives" value={s.openJobs} />
        <Stat label="Eligible for" value={s.eligibleJobs} hint={`${s.notAppliedEligible} not applied yet`} />
        <Stat label="My applications" value={s.applications} />
        <Stat label="Upcoming interviews" value={s.upcomingInterviews} />
      </div>
      {Object.keys(s.byStatus).length > 0 && (
        <div className="card">
          <strong>Application status</strong>
          <div className="row wrap" style={{ marginTop: 8 }}>
            {Object.entries(s.byStatus).map(([k, v]) => <span key={k}><StatusBadge status={k} /> × {v}</span>)}
          </div>
        </div>
      )}
    </>
  );
}
