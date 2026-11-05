import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class SubjectsScreen extends StatefulWidget {
  const SubjectsScreen({super.key, required this.api});
  final ApiService api;
  @override
  State<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends State<SubjectsScreen> {
  late Future<List<Subject>> _future;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _future = widget.api.getSubjects();
  }

  void _reload() => setState(() => _future = widget.api.getSubjects(search: _search));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subjects')),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search), hintText: 'Search subjects', border: OutlineInputBorder()),
            onSubmitted: (v) {
              _search = v.trim();
              _reload();
            },
          ),
        ),
        Expanded(
          child: FutureBuilder<List<Subject>>(
            future: _future,
            builder: (context, snap) {
              if (snap.connectionState != ConnectionState.done) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snap.hasError) {
                return Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text('${snap.error}', textAlign: TextAlign.center),
                    OutlinedButton(onPressed: _reload, child: const Text('Retry')),
                  ]),
                );
              }
              final subjects = snap.data!;
              if (subjects.isEmpty) return const Center(child: Text('No subjects available yet.'));
              return RefreshIndicator(
                onRefresh: () async => _reload(),
                child: ListView.builder(
                  itemCount: subjects.length,
                  itemBuilder: (_, i) {
                    final s = subjects[i];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(child: Text(s.code.length > 3 ? s.code.substring(0, 3) : s.code)),
                        title: Text(s.name),
                        subtitle: Text('${s.courseCount} course(s) · ${s.topicCount} topic(s) · ${s.lessonCount} lesson(s)'),
                      ),
                    );
                  },
                ),
              );
            },
          ),
        ),
      ]),
    );
  }
}