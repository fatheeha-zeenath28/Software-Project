import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import SubjectsPage from './pages/SubjectsPage';

const links = [
  { to: '/subjects', label: 'Subjects' },
];

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          ICTify <span>Admin</span>
        </div>
        <nav>
          {links.map((l) => 
          <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
        </nav>
        <div className="mock-user">
          Signed in as test admin 
        </div>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="*" element={<Navigate to="/subjects" replace />} />
        </Routes>
      </main>
    </div>
  );
}