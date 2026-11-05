import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ClassGroup, Teacher } from '../api/types';
import { Empty, ErrorBox } from '../components/Feedback';
import { useLoader } from '../components/useLoader';

export default function AssignmentsPage() {
  const teachers = useLoader(() => api.get<Teacher[]>('/teachers'));
  const classes = useLoader(() => api.get<ClassGroup[]>('/classes'));

  const [classId, setClassId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [oldTeacherId, setOldTeacherId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedClass = classes.data?.find(
    (c) => String(c.id) === classId
  );

  const currentTeachers = selectedClass?.teachers ?? [];

  useEffect(() => {
    setTeacherId('');
    setOldTeacherId(
      String(selectedClass?.teachers?.[0]?.teacherId ?? '')
    );
    setMessage(null);
    setError(null);
  }, [classId, classes.data]);

  const refreshAll = () => {
    classes.reload();
    teachers.reload();
  };

  const assignTeacher = async () => {
    if (!classId || !teacherId) {
      setError('Please select a class and a teacher.');
      return;
    }

    if (currentTeachers.some((t) => t.teacherId === Number(teacherId))) {
      setError('This teacher is already assigned to this class.');
      return;
    }

    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      await api.post(`/classes/${classId}/teachers`, {
        teacherId: Number(teacherId),
      });

      setMessage('Teacher assigned successfully.');
      setTeacherId('');
      refreshAll();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const replaceTeacher = async () => {
    if (!classId || !oldTeacherId || !teacherId) {
      setError('Please select the existing teacher and the new teacher.');
      return;
    }

    if (oldTeacherId === teacherId) {
      setError('Please select a different teacher to replace.');
      return;
    }

    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      await api.patch(`/classes/${classId}/teachers/replace`, {
        oldTeacherId: Number(oldTeacherId),
        newTeacherId: Number(teacherId),
      });

      setMessage('Teacher replaced successfully.');
      setTeacherId('');
      refreshAll();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <header className="page-head">
        <div>
          <h1>Teacher–Class Assignment</h1>
          <p className="muted">
            Assign teachers to classes and manage existing assignments.
          </p>
        </div>
      </header>

      <ErrorBox message={teachers.error ?? classes.error ?? error} />

      <div className="card">
        <h3>Assign teachers to a class</h3>

        <label>
          Select Class
          <select
            className="search"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select a class...</option>
            {classes.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.course?.title})
              </option>
            ))}
          </select>
        </label>

        {classId && (
          <>
            <h3>Currently Assigned Teachers</h3>

            {currentTeachers.length === 0 ? (
              <p className="muted">No teachers assigned to this class yet.</p>
            ) : (
              <div className="teacher-grid">
                {currentTeachers.map((t) => (
                  <div className="teacher-card on" key={t.teacherId}>
                    <span className="chip">Assigned</span>
                    <strong>
                      {t.teacher?.fullName ?? `Teacher #${t.teacherId}`}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div className="form">
              <label>
                Select Teacher
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">Select a teacher...</option>
                  {teachers.data?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.email})
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-actions">
                <button onClick={assignTeacher} disabled={saving}>
                  {saving ? 'Saving...' : 'Assign Teacher'}
                </button>
              </div>

              {currentTeachers.length > 0 && (
                <>
                  <label>
                    Existing Teacher to Replace
                    <select
                      value={oldTeacherId}
                      onChange={(e) => setOldTeacherId(e.target.value)}
                    >
                      <option value="">Select existing teacher...</option>
                      {currentTeachers.map((t) => (
                        <option key={t.teacherId} value={t.teacherId}>
                          {t.teacher?.fullName ?? `Teacher #${t.teacherId}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="form-actions">
                    <button
                      className="ghost"
                      onClick={replaceTeacher}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Replace Teacher'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {message && (
              <p className="badge ok">{message}</p>
            )}
          </>
        )}
      </div>

      <h3>Current Class Assignments</h3>

      {!classes.data?.some((c) => c.teachers?.length > 0) ? (
        <Empty text="No teachers assigned yet." />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Course</th>
              <th>Teacher</th>
              <th>Assigned On</th>
            </tr>
          </thead>

          <tbody>
            {classes.data.flatMap((c) =>
              (c.teachers ?? []).map((t) => (
                <tr key={`${c.id}-${t.teacherId}`}>
                  <td>{c.name}</td>
                  <td>{c.course?.title ?? '-'}</td>
                  <td>
                    {t.teacher?.fullName ?? `Teacher #${t.teacherId}`}
                  </td>
                  <td>
                    {t.assignedAt
                      ? new Date(t.assignedAt).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
