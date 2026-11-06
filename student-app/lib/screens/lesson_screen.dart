import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class LessonScreen extends StatelessWidget {
  const LessonScreen({super.key, required this.api, required this.lessonId});
  final ApiService api;
  final int lessonId;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Lesson')),
      body: FutureBuilder<LessonDetail>(
        future: api.getLesson(lessonId),
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) return Center(child: Text('${snap.error}'));
          final l = snap.data!;
          return ListView(padding: const EdgeInsets.all(20), children: [
            Text(l.title, style: t.headlineSmall),
            Text('${l.subjectName} › ${l.topicTitle}', style: t.bodySmall),
            Text('By ${l.teacherName}', style: t.bodySmall),
            const Divider(height: 32),
            Text(l.description ?? 'No description yet.', style: t.bodyLarge),
            const SizedBox(height: 24),
            const Card(child: ListTile(leading: Icon(Icons.ondemand_video),
                title: Text('Videos & notes'), subtitle: Text('Coming in Sprint 02'))),
          ]);
        },
      ),
    );
  }
}