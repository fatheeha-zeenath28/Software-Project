import request from 'supertest';
import { createTestApp } from './test-app';

describe('Lessons API (e2e) - AILP-89', () => {
  let ctx: Awaited<ReturnType<typeof createTestApp>>;
  let http: ReturnType<typeof request>;
  let topicId: number;
  let lessonId: number;

  beforeAll(async () => {
    ctx = await createTestApp();
    http = request(ctx.app.getHttpServer());
    const subjectId = (await ctx.prisma.subject.create({ data: { code: 'ICT', name: 'ICT' } })).id;
    topicId = (await ctx.prisma.topic.create({ data: { subjectId, title: 'SQL' } })).id;
  });
  afterAll(() => ctx.app.close());

  it('teacher creates a lesson', async () => {
    const res = await http.post('/api/lessons').set(ctx.as(ctx.teacher.id))
      .send({ topicId, title: 'SELECT basics' }).expect(201);
    lessonId = res.body.id;
  });
  it('rejects a missing topic', () =>
    http.post('/api/lessons').set(ctx.as(ctx.teacher.id)).send({ topicId: 999, title: 'X' }).expect(400));
  it('students cannot create lessons', () =>
    http.post('/api/lessons').set(ctx.as(ctx.student.id)).send({ topicId, title: 'X' }).expect(403));
  it('another teacher cannot edit it', () =>
    http.patch(`/api/lessons/${lessonId}`).set(ctx.as(ctx.teacher2.id)).send({ title: 'Hacked' }).expect(403));
  it('owner can edit', () =>
    http.patch(`/api/lessons/${lessonId}`).set(ctx.as(ctx.teacher.id)).send({ title: 'SELECT & WHERE' }).expect(200));
  it('unpublished lessons are hidden from students', async () => {
    await http.patch(`/api/lessons/${lessonId}`).set(ctx.as(ctx.teacher.id)).send({ isPublished: false }).expect(200);
    await http.get(`/api/lessons/${lessonId}`).set(ctx.as(ctx.student.id)).expect(404);
  });
  it('owner deletes the lesson', () =>
    http.delete(`/api/lessons/${lessonId}`).set(ctx.as(ctx.teacher.id)).expect(200));
});