import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:alict_mobile_app/config.dart';
import 'package:alict_mobile_app/main.dart';
import 'package:alict_mobile_app/models/models.dart';
import 'package:alict_mobile_app/screens/student/subjects_screen.dart';
import 'package:alict_mobile_app/screens/student/syllabus_screen.dart';
import 'package:alict_mobile_app/screens/teacher/lesson_form_screen.dart';
import 'package:alict_mobile_app/screens/teacher/lesson_list_screen.dart';
import 'package:alict_mobile_app/services/api_service.dart';

/// Fake API so the tests run without the backend.
class FakeApi extends ApiService {
  final ict = Subject(id: 1, code: 'ICT', name: 'Information & Communication Technology');
  LessonInput? created;

  @override
  Future<List<Subject>> getSubjects({String search = ''}) async => [ict];

  @override
  Future<List<TopicNode>> getSyllabus(int subjectId) async => [
        TopicNode(id: 1, title: 'Databases', children: [
          TopicNode(id: 2, title: 'SQL', lessons: [LessonSummary(id: 9, title: 'SELECT basics')]),
        ]),
      ];

  @override
  Future<List<TopicNode>> getTopicTree(int subjectId) async =>
      [TopicNode(id: 1, title: 'Databases', children: [TopicNode(id: 2, title: 'SQL')])];

  @override
  Future<List<Lesson>> getMyLessons({int? subjectId}) async => [
        Lesson(id: 1, subjectId: 1, topicId: 2, title: 'SQL - Introduction',
            subjectCode: 'ICT', topicTitle: 'SQL'),
      ];

  @override
  Future<void> createLesson(LessonInput input) async => created = input;
}

void main() {
  // ---------- Role screen ----------
  testWidgets('student button opens Subjects as the student', (tester) async {
    final api = FakeApi();
    await tester.pumpWidget(AlIctApp(api: api));
    await tester.tap(find.byKey(const Key('studentButton')));
    await tester.pumpAndSettle();
    expect(find.text('Information & Communication Technology'), findsOneWidget);
    expect(api.userId, AppConfig.studentUserId);
  });

  testWidgets('teacher button opens My Lessons with bottom tabs', (tester) async {
    final api = FakeApi();
    await tester.pumpWidget(AlIctApp(api: api));
    await tester.tap(find.byKey(const Key('teacherButton')));
    await tester.pumpAndSettle();
    expect(find.text('SQL - Introduction'), findsOneWidget);
    expect(find.text('Browse'), findsOneWidget);
    expect(api.userId, AppConfig.teacherUserId);
  });

  // ---------- Student ----------
  test('counts lessons in sub-topics', () {
    final t = TopicNode(id: 1, title: 'A', children: [
      TopicNode(id: 2, title: 'B', lessons: [LessonSummary(id: 1, title: 'L')]),
    ]);
    expect(t.totalLessons, 1);
  });

  testWidgets('subjects screen lists subjects', (tester) async {
    await tester.pumpWidget(MaterialApp(home: SubjectsScreen(api: FakeApi())));
    await tester.pumpAndSettle();
    expect(find.text('Information & Communication Technology'), findsOneWidget);
  });

  testWidgets('syllabus expands to show lessons', (tester) async {
    final api = FakeApi();
    await tester.pumpWidget(MaterialApp(home: SyllabusScreen(api: api, subject: api.ict)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('1  Databases'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('1.1  SQL'));
    await tester.pumpAndSettle();
    expect(find.text('SELECT basics'), findsOneWidget);
  });

  // ---------- Teacher ----------
  test('flattenTopics builds breadcrumb labels', () {
    final flat = flattenTopics([
      TopicNode(id: 1, title: 'Databases', children: [TopicNode(id: 2, title: 'SQL')]),
    ]);
    expect(flat.map((t) => t.label), ['Databases', 'Databases › SQL']);
  });

  testWidgets('lesson list shows my lessons', (tester) async {
    await tester.pumpWidget(MaterialApp(home: LessonListScreen(api: FakeApi())));
    await tester.pumpAndSettle();
    expect(find.text('SQL - Introduction'), findsOneWidget);
  });

  testWidgets('lesson form validates required fields', (tester) async {
    final api = FakeApi();
    await tester.pumpWidget(MaterialApp(home: LessonFormScreen(api: api)));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('saveButton')));
    await tester.pumpAndSettle();
    expect(find.text('Select a subject'), findsOneWidget);
    expect(find.text('Title is required'), findsOneWidget);
    expect(api.created, isNull);
  });
}