import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'syllabus_screen.dart';

class SubjectDetailScreen extends StatelessWidget {
  const SubjectDetailScreen({super.key, required this.api, required this.subject});
  final ApiService api;
  final Subject subject;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(subject.code)),
      floatingActionButton: FloatingActionButton.extended(
  icon: const Icon(Icons.account_tree_outlined),
  label: const Text('Syllabus & lessons'),
  onPressed: () => Navigator.push(
    context,
    MaterialPageRoute(
      builder: (_) => SyllabusScreen(api: api, subject: subject),
    ),
  ),
),
      body: FutureBuilder<List<Course>>(
        future: api.getCourses(subject.id),
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) return Center(child: Text('${snap.error}'));
          final courses = snap.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
            children: [
              Text(subject.name, style: Theme.of(context).textTheme.titleLarge),
              if (subject.description != null) Text(subject.description!),
              const SizedBox(height: 16),
              Text('Courses', style: Theme.of(context).textTheme.titleMedium),
              if (courses.isEmpty) const Text('No courses yet.'),
              ...courses.map((c) => Card(
                    child: ExpansionTile(
                      title: Text(c.title),
                      subtitle: Text('${c.examYear} A/L · ${c.medium.toLowerCase()} medium'),
                      children: [
                        FutureBuilder<List<ClassGroup>>(
                          future: api.getClasses(c.id),
                          builder: (context, s) {
                            if (!s.hasData && !s.hasError) return const LinearProgressIndicator();
                            if (s.hasError) return Text('${s.error}');
                            if (s.data!.isEmpty) return const ListTile(title: Text('No classes yet.'));
                            return Column(
                              children: s.data!
                                  .map((cl) => ListTile(
                                        leading: const Icon(Icons.groups_outlined),
                                        title: Text(cl.name),
                                        subtitle: Text([
                                          if (cl.schedule != null) cl.schedule!,
                                          if (cl.teacherNames.isNotEmpty) 'Teacher: ${cl.teacherNames.join(', ')}',
                                        ].join('\n')),
                                      ))
                                  .toList(),
                            );
                          },
                        ),
                      ],
                    ),
                  )),
            ],
          );
        },
      ),
    );
  }
}