import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:alict_student_app/models/models.dart';
import 'package:alict_student_app/screens/subjects_screen.dart';
import 'package:alict_student_app/screens/syllabus_screen.dart';
import 'package:alict_student_app/services/api_service.dart';

class FakeApi extends ApiService {
  final ict = Subject(id: 1, code: 'ICT', name: 'Information & Communication Technology');
  @override
  Future<List<Subject>> getSubjects({String search = ''}) async => [ict];
  @override
  Future<List<TopicNode>> getSyllabus(int subjectId) async => [
        TopicNode(id: 1, title: 'Databases', children: [
          TopicNode(id: 2, title: 'SQL', lessons: [LessonSummary(id: 9, title: 'SELECT basics')]),
        ]),
      ];
}

void main() {
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
}