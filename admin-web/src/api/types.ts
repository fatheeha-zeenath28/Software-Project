export type Medium = 'SINHALA' | 'ENGLISH' | 'TAMIL';

export interface Subject {
  id: number; 
  code: string; 
  name: string; 
  description: string | null; 
  isActive: boolean;
  _count?: { courses: number; topics: number; lessons: number };
}
export interface Course {
  id: number; 
  subjectId: number; 
  title: string; 
  description: string | null;
  medium: Medium; 
  examYear: number; 
  isActive: boolean;
  subject?: { id: number; code: string; name: string };
  _count?: { classes: number };
}
export interface Teacher {
  id: number; 
  fullName: string; 
  email: string;
  teacherClasses?: { classGroup: { id: number; name: string } }[];
}
export interface ClassGroup {
  id: number; 
  courseId: number; 
  name: string; 
  description: string | null;
  schedule: string | null; 
  capacity: number | null; 
  isActive: boolean;
  course?: { id: number; title: string; examYear: number };
  teachers: { teacherId: number; assignedAt: string; teacher: Teacher }[];
}
export interface TopicNode {
  id: number; 
  subjectId: number; 
  parentId: number | null; 
  title: string;
  description: string | null; 
  sortOrder: number;
  children: TopicNode[]; 
  lessons?: { id: number; title: string }[];
}
export interface Assignment {
  teacherId: number; 
  classId: number; 
  assignedAt: string; 
  teacher: Teacher;
  classGroup: { id: number; name: string; course: { id: number; title: string } };
}