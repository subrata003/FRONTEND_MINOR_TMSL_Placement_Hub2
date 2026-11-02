import { useEffect, useState } from 'react';
import api, { fmtDate } from '../../api';
import { StatusBadge } from '../../components/ui';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/interviews/my').then((r) => setInterviews(r.data));
    api.get('/results/my').then((r) => setResults(r.data));
  }, []);

  return (
    <>
      <h1>Interview Details</h1>
      {interviews.length === 0 && <p className="muted">No interviews scheduled yet.</p>}
      {interviews.map((i) => (
        <div key={i._id} className="card">
          <div className="row between">
            <h3>{i.job?.company?.name} — {i.job?.title}</h3>
            <span className="status interview-scheduled">Round {i.roundNumber}</span>
          </div>
          <div>{i.roundName}</div>
          <div className="muted">{fmtDate(i.date)} at {i.time} · {i.mode}{i.venue ? ` · ${i.venue}` : ''}</div>
        </div>
      ))}

      <h1>Placement Results</h1>
      {results.length === 0 && <p className="muted">No results declared yet.</p>}
      {results.map((r) => (
        <div key={r._id} className="card">
          <div className="row between">
            <h3>{r.job?.company?.name} — {r.job?.title}</h3>
            <StatusBadge status={r.status} />
          </div>
          {r.status === 'Selected' && r.package && <div>Package: <strong>{r.package} LPA</strong></div>}
          {r.remarks && <div className="muted">{r.remarks}</div>}
        </div>
      ))}
    </>
  );
}
