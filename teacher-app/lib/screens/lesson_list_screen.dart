import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'lesson_form_screen.dart';

class LessonListScreen extends StatefulWidget {
  const LessonListScreen({super.key, required this.api});
  final ApiService api;
  @override
  State<LessonListScreen> createState() => _LessonListScreenState();
}

class _LessonListScreenState extends State<LessonListScreen> {
  late Future<List<Lesson>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.api.getMyLessons();
  }

  void _reload() => setState(() => _future = widget.api.getMyLessons());

  Future<void> _openForm([Lesson? lesson]) async {
    final saved = await Navigator.push<bool>(
        context, MaterialPageRoute(builder: (_) => LessonFormScreen(api: widget.api, lesson: lesson)));
    if (saved == true) _reload();
  }

  Future<void> _delete(Lesson lesson) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete lesson?'),
        content: Text('"${lesson.title}" will be removed.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await widget.api.deleteLesson(lesson.id);
      _reload();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Lessons')),
      floatingActionButton: FloatingActionButton.extended(
          onPressed: () => _openForm(), icon: const Icon(Icons.add), label: const Text('New lesson')),
      body: FutureBuilder<List<Lesson>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text('${snap.error}'),
              OutlinedButton(onPressed: _reload, child: const Text('Retry')),
            ]));
          }
          final lessons = snap.data!;
          if (lessons.isEmpty) return const Center(child: Text('No lessons yet. Tap "New lesson".'));
          return RefreshIndicator(
            onRefresh: () async => _reload(),
            child: ListView.separated(
              padding: const EdgeInsets.only(bottom: 88),
              itemCount: lessons.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final l = lessons[i];
                return ListTile(
                  leading: Icon(l.isPublished ? Icons.menu_book : Icons.visibility_off),
                  title: Text(l.title),
                  subtitle: Text('${l.subjectCode ?? ''} · ${l.topicTitle ?? ''}'),
                  onTap: () => _openForm(l),
                  trailing: PopupMenuButton<String>(
                    onSelected: (v) => v == 'edit' ? _openForm(l) : _delete(l),
                    itemBuilder: (_) => const [
                      PopupMenuItem(value: 'edit', child: Text('Edit')),
                      PopupMenuItem(value: 'delete', child: Text('Delete')),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}