class Subject {
  final int id;
  final String code, name;
  Subject({required this.id, required this.code, required this.name});
  factory Subject.fromJson(Map<String, dynamic> j) => Subject(id: j['id'], code: j['code'], name: j['name']);
}

class TopicNode {
  final int id;
  final String title;
  final List<TopicNode> children;
  TopicNode({required this.id, required this.title, this.children = const []});
  factory TopicNode.fromJson(Map<String, dynamic> j) => TopicNode(
        id: j['id'], title: j['title'],
        children: ((j['children'] as List?) ?? []).map((c) => TopicNode.fromJson(c)).toList(),
      );
}

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