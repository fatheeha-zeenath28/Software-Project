class Subject {
  final int id;
  final String code, name;
  final String? description;
  final int courseCount, topicCount, lessonCount;
  Subject({required this.id, required this.code, required this.name, this.description,
      this.courseCount = 0, this.topicCount = 0, this.lessonCount = 0});

  factory Subject.fromJson(Map<String, dynamic> j) {
    final c = (j['_count'] as Map<String, dynamic>?) ?? const {};
    return Subject(
      id: j['id'], code: j['code'], name: j['name'], description: j['description'],
      courseCount: c['courses'] ?? 0, topicCount: c['topics'] ?? 0, lessonCount: c['lessons'] ?? 0,
    );
  }
}

class Course {
  final int id, examYear;
  final String title, medium;
  Course({required this.id, required this.title, required this.medium, required this.examYear});
  factory Course.fromJson(Map<String, dynamic> j) =>
      Course(id: j['id'], title: j['title'], medium: j['medium'], examYear: j['examYear']);
}

class ClassGroup {
  final int id;
  final String name;
  final String? schedule;
  final List<String> teacherNames;
  ClassGroup({required this.id, required this.name, this.schedule, this.teacherNames = const []});
  factory ClassGroup.fromJson(Map<String, dynamic> j) => ClassGroup(
        id: j['id'], name: j['name'], schedule: j['schedule'],
        teacherNames: ((j['teachers'] as List?) ?? [])
            .map((t) => t['teacher']['fullName'] as String).toList(),
      );
}

class LessonSummary {
  final int id;
  final String title;
  LessonSummary({required this.id, required this.title});
  factory LessonSummary.fromJson(Map<String, dynamic> j) => LessonSummary(id: j['id'], title: j['title']);
}

class TopicNode {
  final int id;
  final String title;
  final List<TopicNode> children;
  final List<LessonSummary> lessons;
  TopicNode({required this.id, required this.title, this.children = const [], this.lessons = const []});

  int get totalLessons => lessons.length + children.fold(0, (sum, c) => sum + c.totalLessons);

  factory TopicNode.fromJson(Map<String, dynamic> j) => TopicNode(
        id: j['id'], title: j['title'],
        children: ((j['children'] as List?) ?? []).map((c) => TopicNode.fromJson(c)).toList(),
        lessons: ((j['lessons'] as List?) ?? []).map((l) => LessonSummary.fromJson(l)).toList(),
      );
}

class LessonDetail {
  final String title, subjectName, topicTitle, teacherName;
  final String? description;
  LessonDetail({required this.title, this.description, required this.subjectName,
      required this.topicTitle, required this.teacherName});
  factory LessonDetail.fromJson(Map<String, dynamic> j) => LessonDetail(
        title: j['title'], description: j['description'],
        subjectName: j['subject']?['name'] ?? '', topicTitle: j['topic']?['title'] ?? '',
        teacherName: j['teacher']?['fullName'] ?? '',
      );
}
// ================= Teacher models =================

/// A topic flattened for a dropdown, e.g. "Database Management › SQL"
class TopicOption {
  final int id;
  final String label;
  TopicOption(this.id, this.label);
}

List<TopicOption> flattenTopics(List<TopicNode> nodes, [String prefix = '']) {
  final out = <TopicOption>[];
  for (final n in nodes) {
    final label = prefix.isEmpty ? n.title : '$prefix › ${n.title}';
    out.add(TopicOption(n.id, label));
    out.addAll(flattenTopics(n.children, label));
  }
  return out;
}

class Lesson {
  final int id, subjectId, topicId, sortOrder;
  final String title;
  final String? description, subjectCode, topicTitle;
  final bool isPublished;
  Lesson({required this.id, required this.subjectId, required this.topicId, required this.title,
      this.description, this.sortOrder = 0, this.isPublished = true, this.subjectCode, this.topicTitle});

  factory Lesson.fromJson(Map<String, dynamic> j) => Lesson(
        id: j['id'], subjectId: j['subjectId'], topicId: j['topicId'], title: j['title'],
        description: j['description'], sortOrder: j['sortOrder'] ?? 0,
        isPublished: j['isPublished'] ?? true,
        subjectCode: j['subject']?['code'], topicTitle: j['topic']?['title'],
      );
}

class LessonInput {
  final int topicId, sortOrder;
  final String title, description;
  final bool isPublished;
  LessonInput({required this.topicId, required this.title, this.description = '',
      this.sortOrder = 0, this.isPublished = true});

  Map<String, dynamic> toJson() => {
        'topicId': topicId,
        'title': title,
        if (description.isNotEmpty) 'description': description,
        'sortOrder': sortOrder,
        'isPublished': isPublished,
      };
}