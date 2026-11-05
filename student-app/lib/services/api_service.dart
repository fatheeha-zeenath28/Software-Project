import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/models.dart';

class ApiService {
  Future<dynamic> _get(String path) async {
    http.Response res;
    try {
      res = await http.get(Uri.parse('${AppConfig.apiBaseUrl}$path'),
          headers: {'x-user-id': '${AppConfig.mockUserId}'}).timeout(const Duration(seconds: 15));
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

  Future<List<Subject>> getSubjects({String search = ''}) async {
    final q = search.isEmpty ? '' : '?search=${Uri.encodeQueryComponent(search)}';
    return (await _get('/subjects$q') as List).map((e) => Subject.fromJson(e)).toList();
  }

  Future<List<Course>> getCourses(int subjectId) async =>
      (await _get('/courses?subjectId=$subjectId') as List).map((e) => Course.fromJson(e)).toList();

  Future<List<ClassGroup>> getClasses(int courseId) async =>
      (await _get('/classes?courseId=$courseId') as List).map((e) => ClassGroup.fromJson(e)).toList();

  Future<List<TopicNode>> getSyllabus(int subjectId) async =>
      (await _get('/topics/tree?subjectId=$subjectId&withLessons=true') as List)
          .map((e) => TopicNode.fromJson(e)).toList();

  Future<LessonDetail> getLesson(int id) async => LessonDetail.fromJson(await _get('/lessons/$id'));
}