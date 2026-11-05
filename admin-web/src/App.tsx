import { NavLink, Navigate, Route, Routes } from 'react-router-dom';


import SubjectsPage from './pages/SubjectsPage';
import CoursesPage from './pages/CoursesPage';
import ClassesPage from './pages/ClassesPage';
import AssignmentsPage from './pages/AssignmentsPage';
import SyllabusPage from './pages/SyllabusPage';

const links = [
  { to: '/subjects', label: 'Subjects' },
  { to: '/courses', label: 'Courses' },
  { to: '/classes', label: 'Classes' },
  { to: '/assignments', label: 'Teacher Assignment' },
  { to: '/syllabus', label: 'Syllabus & Topics' },
];

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          ICTify
          <span>Admin Portal</span>
        </div>

        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mock-user">
          <div>Signed in as</div>
          <strong>Test Admin</strong>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/subjects" replace />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/syllabus" element={<SyllabusPage />} />
          <Route path="*" element={<Navigate to="/subjects" replace />} />
        </Routes>
      </main>
    </div>
  );
}
