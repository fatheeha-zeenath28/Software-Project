import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api/client';
import type { Subject } from '../api/types';
import Modal from '../components/Modal';
import { Empty, ErrorBox, Loading } from '../components/Feedback';
import { useLoader } from '../components/useLoader';

const blank = { code: '', name: '', description: '', isActive: true };

function validate(f: typeof blank): string | null {
  if (!/^[A-Za-z0-9_-]{2,20}$/.test(f.code.trim())) return 'Code must be 2-20 letters, numbers, - or _';
  if (!f.name.trim()) return 'Name is required';
  return null;
}

export default function SubjectsPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useLoader(
    () => api.get<Subject[]>(`/subjects${search ? `?search=${encodeURIComponent(search)}` : ''}`), [search]);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openForm = (s: Subject | null) => {
    setEditing(s);
    setForm(s ? { code: s.code, name: s.name, description: s.description ?? '', isActive: s.isActive } : blank);
    setFormError(null);
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    if (v) return setFormError(v);
    try {
      const body = { ...form, description: form.description || undefined };
      if (editing) await api.patch(`/subjects/${editing.id}`, body);
      else await api.post('/subjects', body);
      setOpen(false);
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const remove = async (s: Subject) => {
    if (!confirm(`Delete subject "${s.name}"?`)) return;
    try {
      await api.del(`/subjects/${s.id}`);
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  };

  return (
    <section>
      <header className="page-head">
        <h1>Subjects</h1>
        <button onClick={() => openForm(null)}>+ New subject</button>
      </header>
      <input className="search" placeholder="Search by name or code…" value={search}
        onChange={(e) => setSearch(e.target.value)} />
      <ErrorBox message={error ?? actionError} />
      {loading ? <Loading /> : !data?.length ? <Empty text="No subjects yet." /> : (
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Courses</th><th>Topics</th><th>Status</th><th /></tr></thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.code}</strong></td>
                <td>{s.name}</td>
                <td>{s._count?.courses ?? 0}</td>
                <td>{s._count?.topics ?? 0}</td>
                <td><span className={`badge ${s.isActive ? 'ok' : 'off'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="actions">
                  <button className="ghost" onClick={() => openForm(s)}>Edit</button>
                  <button className="danger" onClick={() => remove(s)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal title={editing ? 'Edit subject' : 'New subject'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="form">
          <label>Code *<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
          <label>Name *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Description<textarea rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="check"><input type="checkbox" checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <ErrorBox message={formError} />
          <div className="form-actions">
            <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}