import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Assignment, ClassGroup, Teacher } from '../api/types';
import { Empty, ErrorBox } from '../components/Feedback';
import { useLoader } from '../components/useLoader';

export default function AssignmentsPage() {
  const teachers = useLoader(() => api.get<Teacher[]>('/teachers'));
  const classes = useLoader(() => api.get<ClassGroup[]>('/classes'));
  const assignments = useLoader(() => api.get<Assignment[]>('/teacher-assignments'));
  const [classId, setClassId] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // When a class is chosen, tick its current teachers
  useEffect(() => {
    const cls = classes.data?.find((c) => String(c.id) === classId);
    setSelected(new Set(cls?.teachers.map((t) => t.teacherId) ?? []));
    setMessage(null);
  }, [classId, classes.data]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const refreshAll = () => { classes.reload(); assignments.reload(); teachers.reload(); };

  const save = async () => {
    setError(null);
    try {
      await api.put(`/classes/${classId}/teachers`, { teacherIds: [...selected] });
      setMessage('Assignments saved.');
      refreshAll();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const unassign = async (a: Assignment) => {
    if (!confirm(`Remove ${a.teacher.fullName} from ${a.classGroup.name}?`)) return;
    try { await api.del(`/classes/${a.classId}/teachers/${a.teacherId}`); refreshAll(); }
    catch (err) { setError((err as Error).message); }
  };

  return (
    <section>
      <header className="page-head"><h1>Teacher–Class Assignment</h1></header>
      <ErrorBox message={teachers.error ?? classes.error ?? assignments.error ?? error} />
      <div className="card">
        <h3>Assign teachers to a class</h3>
        <select className="search" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select a class…</option>
          {classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.course?.title})</option>)}
        </select>
        {classId && (
          <>
            <div className="teacher-grid">
              {teachers.data?.map((t) => (
                <label key={t.id} className={`teacher-card ${selected.has(t.id) ? 'on' : ''}`}>
                  <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
                  <div><strong>{t.fullName}</strong><div className="muted">{t.teacherClasses?.length ?? 0} class(es)</div></div>
                </label>
              ))}
            </div>
            <button onClick={save}>Save assignments</button> {message && <span>{message}</span>}
          </>
        )}
      </div>
      <h3>Current assignments</h3>
      {!assignments.data?.length ? <Empty text="No teachers assigned yet." /> : (
        <table>
          <thead><tr><th>Class</th><th>Course</th><th>Teacher</th><th>Assigned on</th><th /></tr></thead>
          <tbody>
            {assignments.data.map((a) => (
              <tr key={`${a.classId}-${a.teacherId}`}>
                <td>{a.classGroup.name}</td><td>{a.classGroup.course.title}</td><td>{a.teacher.fullName}</td>
                <td>{new Date(a.assignedAt).toLocaleDateString()}</td>
                <td className="actions"><button className="danger" onClick={() => unassign(a)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}