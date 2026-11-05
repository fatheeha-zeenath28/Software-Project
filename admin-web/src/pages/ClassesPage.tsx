import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api/client';
import type { ClassGroup, Course } from '../api/types';
import Modal from '../components/Modal';
import { Empty, ErrorBox, Loading } from '../components/Feedback';
import { useLoader } from '../components/useLoader';

const blank = { courseId: '', name: '', schedule: '', capacity: '', description: '', isActive: true };

export default function ClassesPage() {
  const [filter, setFilter] = useState('');
  const courses = useLoader(() => api.get<Course[]>('/courses'));
  const { data, loading, error, reload } = useLoader(
    () => api.get<ClassGroup[]>(`/classes${filter ? `?courseId=${filter}` : ''}`), [filter]);
  const [editing, setEditing] = useState<ClassGroup | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openForm = (c: ClassGroup | null) => {
    setEditing(c);
    setForm(c ? { courseId: String(c.courseId), name: c.name, schedule: c.schedule ?? '',
      capacity: c.capacity ? String(c.capacity) : '', description: c.description ?? '', isActive: c.isActive }
      : { ...blank, courseId: filter });
    setFormError(null);
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.courseId) return setFormError('Select a course');
    if (!form.name.trim()) return setFormError('Class name is required');
    if (form.capacity && Number(form.capacity) < 1) return setFormError('Capacity must be a positive number');
    const body = { courseId: Number(form.courseId), name: form.name, schedule: form.schedule || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined, description: form.description || undefined,
      isActive: form.isActive };
    try {
      if (editing) await api.patch(`/classes/${editing.id}`, body);
      else await api.post('/classes', body);
      setOpen(false);
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const remove = async (c: ClassGroup) => {
    if (!confirm(`Delete class "${c.name}"?`)) return;
    try { await api.del(`/classes/${c.id}`); reload(); } catch (err) { setActionError((err as Error).message); }
  };

  const courseOptions = courses.data?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>);

  return (
    <section>
      <header className="page-head"><h1>Classes</h1><button onClick={() => openForm(null)}>+ New class</button></header>
      <select className="search" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All courses</option>{courseOptions}
      </select>
      <ErrorBox message={error ?? actionError} />
      {loading ? <Loading /> : !data?.length ? <Empty text="No classes found." /> : (
        <table>
          <thead><tr><th>Class</th><th>Course</th><th>Schedule</th><th>Capacity</th><th>Teachers</th><th /></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td><td>{c.course?.title}</td>
                <td>{c.schedule ?? '—'}</td><td>{c.capacity ?? '—'}</td>
                <td>{c.teachers.length ? c.teachers.map((t) => <span key={t.teacherId} className="chip">{t.teacher.fullName}</span>)
                  : <span className="muted">None</span>}</td>
                <td className="actions">
                  <button className="ghost" onClick={() => openForm(c)}>Edit</button>
                  <button className="danger" onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal title={editing ? 'Edit class' : 'New class'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="form">
          <label>Course *<select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            <option value="">Select…</option>{courseOptions}</select></label>
          <label>Class name *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <div className="row">
            <label>Schedule<input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></label>
            <label>Capacity<input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
          </div>
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