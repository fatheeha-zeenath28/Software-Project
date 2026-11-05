import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api/client';
import type { Course, Medium, Subject } from '../api/types';
import Modal from '../components/Modal';
import { Empty, ErrorBox, Loading } from '../components/Feedback';
import { useLoader } from '../components/useLoader';

const blank = { subjectId: '', title: '', description: '', medium: 'SINHALA' as Medium,
  examYear: String(new Date().getFullYear() + 1), isActive: true };

function validate(f: typeof blank): string | null {
  if (!f.subjectId) return 'Select a subject';
  if (!f.title.trim()) return 'Title is required';
  const y = Number(f.examYear);
  if (!Number.isInteger(y) || y < 2000 || y > 2100) return 'Exam year must be between 2000 and 2100';
  return null;
}

export default function CoursesPage() {
  const [filter, setFilter] = useState('');
  const subjects = useLoader(() => api.get<Subject[]>('/subjects'));
  const { data, loading, error, reload } = useLoader(
    () => api.get<Course[]>(`/courses${filter ? `?subjectId=${filter}` : ''}`), [filter]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openForm = (c: Course | null) => {
    setEditing(c);
    setForm(c ? { subjectId: String(c.subjectId), title: c.title, description: c.description ?? '',
      medium: c.medium, examYear: String(c.examYear), isActive: c.isActive } : { ...blank, subjectId: filter });
    setFormError(null);
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    if (v) return setFormError(v);
    const body = { subjectId: Number(form.subjectId), title: form.title, description: form.description || undefined,
      medium: form.medium, examYear: Number(form.examYear), isActive: form.isActive };
    try {
      if (editing) await api.patch(`/courses/${editing.id}`, body);
      else await api.post('/courses', body);
      setOpen(false);
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const remove = async (c: Course) => {
    if (!confirm(`Delete course "${c.title}"?`)) return;
    try { await api.del(`/courses/${c.id}`); reload(); } catch (err) { setActionError((err as Error).message); }
  };

  const subjectOptions = subjects.data?.map((s) => <option key={s.id} value={s.id}>{s.code} – {s.name}</option>);

  return (
    <section>
      <header className="page-head"><h1>Courses</h1><button onClick={() => openForm(null)}>+ New course</button></header>
      <select className="search" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All subjects</option>{subjectOptions}
      </select>
      <ErrorBox message={error ?? actionError} />
      {loading ? <Loading /> : !data?.length ? <Empty text="No courses found." /> : (
        <table>
          <thead><tr><th>Title</th><th>Subject</th><th>Exam year</th><th>Medium</th><th>Classes</th><th /></tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.title}</strong></td><td>{c.subject?.code}</td><td>{c.examYear}</td>
                <td>{c.medium}</td><td>{c._count?.classes ?? 0}</td>
                <td className="actions">
                  <button className="ghost" onClick={() => openForm(c)}>Edit</button>
                  <button className="danger" onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal title={editing ? 'Edit course' : 'New course'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="form">
          <label>Subject *<select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
            <option value="">Select…</option>{subjectOptions}</select></label>
          <label>Title *<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <div className="row">
            <label>Exam year *<input type="number" value={form.examYear}
              onChange={(e) => setForm({ ...form, examYear: e.target.value })} /></label>
            <label>Medium<select value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value as Medium })}>
              <option value="SINHALA">Sinhala</option><option value="ENGLISH">English</option><option value="TAMIL">Tamil</option>
            </select></label>
          </div>
          <label>Description<textarea rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
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