import { useEffect } from 'react';

export function StatusBadge({ status }) {
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status ${cls}`}>{status}</span>;
}

export function Alert({ error, success }) {
  if (error) return <div className="alert error">{error}</div>;
  if (success) return <div className="alert success">{success}</div>;
  return null;
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="row between"><h3>{title}</h3><button className="btn ghost" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="muted small">{hint}</div>}
    </div>
  );
}
