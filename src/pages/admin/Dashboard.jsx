import { useEffect, useState } from 'react';
import api from '../../api';
import { Stat } from '../../components/ui';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/dashboard/admin').then((r) => setS(r.data)); }, []);
  if (!s) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Admin Dashboard</h1>
      <div className="grid">
        <Stat label="Total students" value={s.students} />
        <Stat label="Companies" value={s.companies} />
        <Stat label="Jobs posted" value={s.jobs} hint={`${s.openJobs} accepting applications`} />
        <Stat label="Applications" value={s.applications} />
        <Stat label="Placed students" value={s.placed} hint={`${s.placementRate}% placement rate`} />
        <Stat label="Upcoming interviews" value={s.upcomingInterviews} />
      </div>
    </>
  );
}
