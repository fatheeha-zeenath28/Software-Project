import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'lesson_screen.dart';

class SyllabusScreen extends StatelessWidget {
  const SyllabusScreen({super.key, required this.api, required this.subject});
  final ApiService api;
  final Subject subject;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${subject.code} Syllabus')),
      body: FutureBuilder<List<TopicNode>>(
        future: api.getSyllabus(subject.id),
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) return Center(child: Text('${snap.error}'));
          final topics = snap.data!;
          if (topics.isEmpty) return const Center(child: Text('Syllabus not published yet.'));
          return ListView(children: [
            for (var i = 0; i < topics.length; i++) TopicTile(api: api, topic: topics[i], number: '${i + 1}'),
          ]);
        },
      ),
    );
  }
}

class TopicTile extends StatelessWidget {
  const TopicTile({super.key, required this.api, required this.topic, required this.number, this.depth = 0});
  final ApiService api;
  final TopicNode topic;
  final String number;
  final int depth;

  @override
  Widget build(BuildContext context) {
    return ExpansionTile(
      tilePadding: EdgeInsets.only(left: 16.0 + depth * 16, right: 16),
      title: Text('$number  ${topic.title}'),
      subtitle: Text('${topic.totalLessons} lesson(s)'),
      children: [
        for (var i = 0; i < topic.children.length; i++)
          TopicTile(api: api, topic: topic.children[i], number: '$number.${i + 1}', depth: depth + 1),
        ...topic.lessons.map((l) => ListTile(
              contentPadding: EdgeInsets.only(left: 32.0 + depth * 16, right: 16),
              leading: const Icon(Icons.play_lesson_outlined),
              title: Text(l.title),
              onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => LessonScreen(api: api, lessonId: l.id))),
            )),
      ],
    );
  }
}