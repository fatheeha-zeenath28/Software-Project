
import { PrismaClient, Role, Medium } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create test users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alict.com' },
    update: {},
    create: {
      fullName: 'Platform Admin',
      email: 'admin@alict.com',
      role: Role.ADMIN,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@alict.com' },
    update: {},
    create: {
      fullName: 'ICT Teacher',
      email: 'teacher@alict.com',
      role: Role.TEACHER,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@alict.com' },
    update: {},
    create: {
      fullName: 'ICT Student',
      email: 'student@alict.com',
      role: Role.STUDENT,
    },
  });

  console.log('Test users created.');

  // 2. Create ICT subject
  const subject = await prisma.subject.upsert({
    where: { code: 'ICT' },
    update: {},
    create: {
      code: 'ICT',
      name: 'Information and Communication Technology',
      description: 'G.C.E. Advanced Level ICT subject',
    },
  });

  // 3. Create ICT course
  const course = await prisma.course.upsert({
    where: {
      subjectId_title_examYear: {
        subjectId: subject.id,
        title: '2026 A/L ICT Sinhala Medium',
        examYear: 2026,
      },
    },
    update: {},
    create: {
      subjectId: subject.id,
      title: '2026 A/L ICT Sinhala Medium',
      description: 'Advanced Level ICT theory course',
      medium: Medium.SINHALA,
      examYear: 2026,
    },
  });

  // 4. Create class
  const classGroup = await prisma.classGroup.upsert({
    where: {
      courseId_name: {
        courseId: course.id,
        name: '2026 ICT Theory Class',
      },
    },
    update: {},
    create: {
      courseId: course.id,
      name: '2026 ICT Theory Class',
      description: 'Sample ICT theory class',
      schedule: 'Saturday 8.00 AM',
      capacity: 100,
    },
  });

  // 5. Assign teacher to class
  await prisma.teacherClass.upsert({
    where: {
      teacherId_classId: {
        teacherId: teacher.id,
        classId: classGroup.id,
      },
    },
    update: {},
    create: {
      teacherId: teacher.id,
      classId: classGroup.id,
    },
  });

  // 6. Create a syllabus topic
  let topic = await prisma.topic.findFirst({
    where: {
      subjectId: subject.id,
      title: 'Information Systems',
      parentId: null,
    },
  });

  if (!topic) {
    topic = await prisma.topic.create({
      data: {
        subjectId: subject.id,
        title: 'Information Systems',
        description: 'Introduction to information systems',
        sortOrder: 1,
      },
    });
  }

  // 7. Create a sample lesson
  const existingLesson = await prisma.lesson.findFirst({
    where: {
      subjectId: subject.id,
      topicId: topic.id,
      teacherId: teacher.id,
      title: 'Introduction to Information Systems',
    },
  });

  if (!existingLesson) {
    await prisma.lesson.create({
      data: {
        subjectId: subject.id,
        topicId: topic.id,
        teacherId: teacher.id,
        title: 'Introduction to Information Systems',
        description: 'Introduction to basic information systems concepts',
        sortOrder: 1,
        isPublished: true,
      },
    });
  }

  console.log('Database seeding completed successfully!');
  console.log({
    admin: admin.email,
    teacher: teacher.email,
    student: student.email,
    subject: subject.name,
    course: course.title,
    class: classGroup.name,
  });
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
