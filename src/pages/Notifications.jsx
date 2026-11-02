import { useEffect, useState } from 'react';
import api, { fmtDate } from '../api';

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = () => api.get('/notifications').then((r) => setItems(r.data.items));
  useEffect(() => { load(); }, []);

  const markAll = async () => { await api.patch('/notifications/read-all'); load(); };

  return (
    <>
      <div className="row between">
        <h1>Notifications</h1>
        <button className="btn ghost" onClick={markAll}>Mark all as read</button>
      </div>
      {items.length === 0 && <p className="muted">No notifications yet.</p>}
      {items.map((n) => (
        <div key={n._id} className={`card note ${n.read ? '' : 'unread'}`}>
          <strong>{n.title}</strong>
          <div>{n.message}</div>
          <div className="muted small">{fmtDate(n.createdAt)}</div>
        </div>
      ))}
    </>
  );
}
