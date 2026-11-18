import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/models.dart';

class ApiService {
  ApiService({this.userId = 0});

  /// The test user the app is acting as. Set on the role screen.
  /// Replaced by a real login token in Sprint 06.
  int userId;

  Map<String, String> get _headers =>
      {'Content-Type': 'application/json', 'x-user-id': '$userId'};

  Future<dynamic> _send(String method, String path, [Object? body]) async {
    http.Response res;
    try {
      final req = http.Request(method, Uri.parse('${AppConfig.apiBaseUrl}$path'))
        ..headers.addAll(_headers);
      if (body != null) req.body = jsonEncode(body);
      res = await http.Response.fromStream(
          await req.send().timeout(const Duration(seconds: 15)));
    } catch (_) {
      throw Exception('Cannot reach the server. Check your connection and API URL.');
    }
    final data = res.body.isEmpty ? null : jsonDecode(res.body);
    if (res.statusCode >= 400) {
      final msg = data is Map ? data['message'] : null;
      throw Exception(msg is List ? msg.join(', ') : (msg ?? 'Request failed'));
    }
    return data;
  }

  // ---------- Used by both roles ----------
  Future<List<Subject>> getSubjects({String search = ''}) async {
    final q = search.isEmpty ? '' : '?search=${Uri.encodeQueryComponent(search)}';
    return (await _send('GET', '/subjects$q') as List).map((e) => Subject.fromJson(e)).toList();
  }

  // ---------- Student screens ----------
  Future<List<Course>> getCourses(int subjectId) async =>
      (await _send('GET', '/courses?subjectId=$subjectId') as List).map((e) => Course.fromJson(e)).toList();

  Future<List<ClassGroup>> getClasses(int courseId) async =>
      (await _send('GET', '/classes?courseId=$courseId') as List).map((e) => ClassGroup.fromJson(e)).toList();

  Future<List<TopicNode>> getSyllabus(int subjectId) async =>
      (await _send('GET', '/topics/tree?subjectId=$subjectId&withLessons=true') as List)
          .map((e) => TopicNode.fromJson(e)).toList();

  Future<LessonDetail> getLesson(int id) async => LessonDetail.fromJson(await _send('GET', '/lessons/$id'));

  // ---------- Teacher screens ----------
  Future<List<TopicNode>> getTopicTree(int subjectId) async =>
      (await _send('GET', '/topics/tree?subjectId=$subjectId') as List).map((e) => TopicNode.fromJson(e)).toList();

  Future<List<Lesson>> getMyLessons({int? subjectId}) async {
    final q = subjectId == null ? '' : '&subjectId=$subjectId';
    return (await _send('GET', '/lessons?mine=true$q') as List).map((e) => Lesson.fromJson(e)).toList();
  }

  Future<void> createLesson(LessonInput input) async => _send('POST', '/lessons', input.toJson());
  Future<void> updateLesson(int id, LessonInput input) async => _send('PATCH', '/lessons/$id', input.toJson());
  Future<void> deleteLesson(int id) async => _send('DELETE', '/lessons/$id');
}