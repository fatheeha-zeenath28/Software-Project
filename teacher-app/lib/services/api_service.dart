import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/models.dart';

class ApiService {
  Map<String, String> get _headers =>
      {'Content-Type': 'application/json', 'x-user-id': '${AppConfig.mockUserId}'};

  Future<dynamic> _send(String method, String path, [Object? body]) async {
    http.Response res;
    try {
      final req = http.Request(method, Uri.parse('${AppConfig.apiBaseUrl}$path'))..headers.addAll(_headers);
      if (body != null) req.body = jsonEncode(body);
      res = await http.Response.fromStream(await req.send()).timeout(const Duration(seconds: 15));
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

  Future<List<Subject>> getSubjects() async =>
      (await _send('GET', '/subjects') as List).map((e) => Subject.fromJson(e)).toList();

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