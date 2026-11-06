import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class LessonFormScreen extends StatefulWidget {
  const LessonFormScreen({super.key, required this.api, this.lesson});
  final ApiService api;
  final Lesson? lesson; // null = create, otherwise edit
  @override
  State<LessonFormScreen> createState() => _LessonFormScreenState();
}

class _LessonFormScreenState extends State<LessonFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _title = TextEditingController(text: widget.lesson?.title ?? '');
  late final _description = TextEditingController(text: widget.lesson?.description ?? '');
  late final _order = TextEditingController(text: '${widget.lesson?.sortOrder ?? 1}');
  List<Subject> _subjects = [];
  List<TopicOption> _topics = [];
  late int? _subjectId = widget.lesson?.subjectId;
  late int? _topicId = widget.lesson?.topicId;
  late bool _published = widget.lesson?.isPublished ?? true;
  bool _loading = true, _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      _subjects = await widget.api.getSubjects();
      if (_subjectId != null) _topics = flattenTopics(await widget.api.getTopicTree(_subjectId!));
    } catch (e) {
      _error = '$e';
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _onSubjectChanged(int? id) async {
    if (id == null) return;
    setState(() { _subjectId = id; _topicId = null; _topics = []; });
    try {
      final tree = await widget.api.getTopicTree(id);
      setState(() => _topics = flattenTopics(tree));
    } catch (e) {
      setState(() => _error = '$e');
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _saving = true; _error = null; });
    final input = LessonInput(
      topicId: _topicId!, title: _title.text.trim(), description: _description.text.trim(),
      sortOrder: int.tryParse(_order.text) ?? 0, isPublished: _published,
    );
    try {
      if (widget.lesson == null) {
        await widget.api.createLesson(input);
      } else {
        await widget.api.updateLesson(widget.lesson!.id, input);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.lesson == null ? 'New lesson' : 'Edit lesson')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(padding: const EdgeInsets.all(16), children: [
                DropdownButtonFormField<int>(
                  value: _subjectId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Subject *', border: OutlineInputBorder()),
                  items: _subjects.map((s) => DropdownMenuItem(value: s.id, child: Text('${s.code} – ${s.name}'))).toList(),
                  onChanged: _onSubjectChanged,
                  validator: (v) => v == null ? 'Select a subject' : null,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<int>(
                  value: _topics.any((t) => t.id == _topicId) ? _topicId : null,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Syllabus topic *', border: OutlineInputBorder()),
                  hint: Text(_subjectId == null ? 'Choose a subject first' : 'Choose a topic'),
                  items: _topics.map((t) => DropdownMenuItem(value: t.id, child: Text(t.label, overflow: TextOverflow.ellipsis))).toList(),
                  onChanged: (v) => setState(() => _topicId = v),
                  validator: (v) => v == null ? 'Select a topic' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  key: const Key('titleField'),
                  controller: _title,
                  maxLength: 200,
                  decoration: const InputDecoration(labelText: 'Lesson title *', border: OutlineInputBorder()),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Title is required' : null,
                ),
                TextFormField(
                  controller: _description,
                  maxLines: 4,
                  decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _order,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Order within topic', border: OutlineInputBorder()),
                ),
                SwitchListTile(
                  title: const Text('Published (visible to students)'),
                  value: _published,
                  onChanged: (v) => setState(() => _published = v),
                ),
                if (_error != null)
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                const SizedBox(height: 8),
                FilledButton(
                  key: const Key('saveButton'),
                  onPressed: _saving ? null : _save,
                  child: Text(_saving ? 'Saving…' : 'Save lesson'),
                ),
              ]),
            ),
    );
  }
}