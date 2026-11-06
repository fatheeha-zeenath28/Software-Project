import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:alict_teacher_app/models/models.dart';
import 'package:alict_teacher_app/screens/lesson_form_screen.dart';
import 'package:alict_teacher_app/screens/lesson_list_screen.dart';
import 'package:alict_teacher_app/services/api_service.dart';

class FakeApi extends ApiService {
  LessonInput? created;
  @override
  Future<List<Subject>> getSubjects() async => [Subject(id: 1, code: 'ICT', name: 'ICT')];
  @override
  Future<List<TopicNode>> getTopicTree(int subjectId) async =>
      [TopicNode(id: 1, title: 'Databases', children: [TopicNode(id: 2, title: 'SQL')])];
  @override
  Future<List<Lesson>> getMyLessons({int? subjectId}) async =>
      [Lesson(id: 1, subjectId: 1, topicId: 2, title: 'SQL - Introduction', subjectCode: 'ICT', topicTitle: 'SQL')];
  @override
  Future<void> createLesson(LessonInput input) async => created = input;
}

void main() {
  test('flattenTopics builds breadcrumb labels', () {
    final flat = flattenTopics([TopicNode(id: 1, title: 'Databases', children: [TopicNode(id: 2, title: 'SQL')])]);
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