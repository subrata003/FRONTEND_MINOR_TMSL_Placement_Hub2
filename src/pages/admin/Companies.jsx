import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { Alert, Modal } from '../../components/ui';

const blank = { name: '', industry: '', website: '', location: '', contactEmail: '', description: '' };

export default function Companies() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null); // null = closed
  const [error, setError] = useState('');

  const load = () => api.get('/companies').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      form._id ? await api.put(`/companies/${form._id}`, form) : await api.post('/companies', form);
      setForm(null); setError(''); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const remove = async (c) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    try { await api.delete(`/companies/${c._id}`); setError(''); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <div className="row between"><h1>Companies</h1><button className="btn" onClick={() => setForm(blank)}>+ Add company</button></div>
      <Alert error={!form && error} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Industry</th><th>Location</th><th>Website</th><th>Contact</th><th /></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td><td>{c.industry || '—'}</td><td>{c.location || '—'}</td>
                <td>{c.website ? <a href={c.website} target="_blank" rel="noreferrer">{c.website}</a> : '—'}</td>
                <td>{c.contactEmail || '—'}</td>
                <td className="actions">
                  <button className="btn ghost sm" onClick={() => setForm(c)}>Edit</button>
                  <button className="btn danger sm" onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="muted">No companies yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form._id ? 'Edit company' : 'Add company'} onClose={() => { setForm(null); setError(''); }}>
          <form className="form" onSubmit={save}>
            <Alert error={error} />
            <label>Name *<input required value={form.name} onChange={set('name')} /></label>
            <label>Industry<input value={form.industry || ''} onChange={set('industry')} /></label>
            <label>Location<input value={form.location || ''} onChange={set('location')} /></label>
            <label>Website<input value={form.website || ''} onChange={set('website')} /></label>
            <label>Contact email<input type="email" value={form.contactEmail || ''} onChange={set('contactEmail')} /></label>
            <label>Description<textarea rows="3" value={form.description || ''} onChange={set('description')} /></label>
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
