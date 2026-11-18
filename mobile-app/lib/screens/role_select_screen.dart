import 'package:flutter/material.dart';
import '../config.dart';
import '../services/api_service.dart';
import 'student/subjects_screen.dart';
import 'teacher/teacher_home_screen.dart';

/// Temporary start screen. Sprint 06 replaces it with real login,
/// which will send the user to the right home based on their role.
class RoleSelectScreen extends StatelessWidget {
  const RoleSelectScreen({super.key, required this.api});
  final ApiService api;

  void _continueAs(BuildContext context, {required bool teacher}) {
    api.userId = teacher ? AppConfig.teacherUserId : AppConfig.studentUserId;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => teacher ? TeacherHomeScreen(api: api) : SubjectsScreen(api: api),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.school, size: 72),
              const SizedBox(height: 16),
              Text('A/L ICT', textAlign: TextAlign.center, style: t.headlineMedium),
              Text('Choose how you want to continue', textAlign: TextAlign.center, style: t.bodyMedium),
              const SizedBox(height: 32),
              FilledButton.icon(
                key: const Key('studentButton'),
                onPressed: () => _continueAs(context, teacher: false),
                icon: const Icon(Icons.person),
                label: const Text("I'm a Student"),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                key: const Key('teacherButton'),
                onPressed: () => _continueAs(context, teacher: true),
                icon: const Icon(Icons.badge_outlined),
                label: const Text("I'm a Teacher"),
              ),
              const SizedBox(height: 24),
              Text('Temporary screen – replaced by login in Sprint 06',
                  textAlign: TextAlign.center, style: t.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}