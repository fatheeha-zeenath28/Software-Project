import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api/client';
import type { Subject, TopicNode } from '../api/types';
import Modal from '../components/Modal';
import { Empty, ErrorBox, Loading } from '../components/Feedback';
import { useLoader } from '../components/useLoader';

// Flat list for the "Parent topic" dropdown
function flatten(nodes: TopicNode[], depth = 0, out: { node: TopicNode; depth: number }[] = []) {
  for (const n of nodes) { out.push({ node: n, depth }); flatten(n.children, depth + 1, out); }
  return out;
}
// A topic plus all its sub-topics (cannot be chosen as its own parent)
function descendantIds(node: TopicNode): Set<number> {
  const ids = new Set<number>([node.id]);
  const walk = (n: TopicNode) => n.children.forEach((c) => { ids.add(c.id); walk(c); });
  walk(node);
  return ids;
}

export default function SyllabusPage() {
  const subjects = useLoader(() => api.get<Subject[]>('/subjects'));
  const [subjectId, setSubjectId] = useState('');
  useEffect(() => {
    if (!subjectId && subjects.data?.length) setSubjectId(String(subjects.data[0].id));
  }, [subjects.data, subjectId]);

  const tree = useLoader<TopicNode[]>(
    () => (subjectId
        ? api.get<TopicNode[]>(`/topics/tree?subjectId=${subjectId}&includeLessons=true`)
        : Promise.resolve([])),
    [subjectId]
    );
  const flat = useMemo(() => flatten(tree.data ?? []), [tree.data]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TopicNode | null>(null);
  const [form, setForm] = useState({ title: '', description: '', sortOrder: '0', parentId: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = (parent: TopicNode | null) => {
    setEditing(null);
    const siblings = parent ? parent.children : tree.data ?? [];
    setForm({ title: '', description: '', sortOrder: String(siblings.length + 1), parentId: parent ? String(parent.id) : '' });
    setFormError(null);
    setOpen(true);
  };
  const openEdit = (t: TopicNode) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description ?? '', sortOrder: String(t.sortOrder),
      parentId: t.parentId ? String(t.parentId) : '' });
    setFormError(null);
    setOpen(true);
  };
  const blocked = editing ? descendantIds(editing) : new Set<number>();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError('Title is required');
    const body = { title: form.title, description: form.description || undefined,
      sortOrder: Number(form.sortOrder) || 0, parentId: form.parentId ? Number(form.parentId) : null };
    try {
      if (editing) await api.patch(`/topics/${editing.id}`, body);
      else await api.post('/topics', { ...body, subjectId: Number(subjectId) });
      setOpen(false);
      tree.reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const remove = async (t: TopicNode) => {
    if (!confirm(`Delete topic "${t.title}"?`)) return;
    try { await api.del(`/topics/${t.id}`); tree.reload(); } catch (err) { setActionError((err as Error).message); }
  };

  const renderNode = (t: TopicNode, number: string) => (
    <li key={t.id}>
      <div className="tree-row">
        <span className="tree-num">{number}</span>
        <span>{t.title}</span>
        {!!t.lessons?.length && <span className="chip">{t.lessons.length} lesson(s)</span>}
        <span className="tree-actions">
          <button className="ghost small" onClick={() => openCreate(t)}>+ Sub-topic</button>
          <button className="ghost small" onClick={() => openEdit(t)}>Edit</button>
          <button className="danger small" onClick={() => remove(t)}>Delete</button>
        </span>
      </div>
      {t.children.length > 0 && <ul>{t.children.map((c, i) => renderNode(c, `${number}.${i + 1}`))}</ul>}
    </li>
  );

  return (
    <section>
      <header className="page-head">
        <h1>Syllabus & Topics</h1>
        <button onClick={() => openCreate(null)} disabled={!subjectId}>+ New unit</button>
      </header>
      <select className="search" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
        {subjects.data?.map((s) => <option key={s.id} value={s.id}>{s.code} – {s.name}</option>)}
      </select>
      <ErrorBox message={subjects.error ?? tree.error ?? actionError} />
      {tree.loading ? <Loading /> : !tree.data?.length ? <Empty text="No topics yet. Add the first unit." /> : (
        <ul className="tree">{tree.data.map((t, i) => renderNode(t, String(i + 1)))}</ul>
      )}
      <Modal title={editing ? 'Edit topic' : 'New topic'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="form">
          <label>Parent topic
            <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">— Top-level unit —</option>
              {flat.filter(({ node }) => !blocked.has(node.id)).map(({ node, depth }) => (
                <option key={node.id} value={node.id}>{'\u00a0\u00a0'.repeat(depth)}{node.title}</option>
              ))}
            </select>
          </label>
          <label>Title *<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Order<input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></label>
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