import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../student/subjects_screen.dart';
import 'lesson_list_screen.dart';

/// Teacher home: their own lessons, plus the same syllabus view students see.
class TeacherHomeScreen extends StatefulWidget {
  const TeacherHomeScreen({super.key, required this.api});
  final ApiService api;
  @override
  State<TeacherHomeScreen> createState() => _TeacherHomeScreenState();
}

class _TeacherHomeScreenState extends State<TeacherHomeScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _tab, children: [
        LessonListScreen(api: widget.api),
        SubjectsScreen(api: widget.api),
      ]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.edit_note), label: 'My Lessons'),
          NavigationDestination(icon: Icon(Icons.menu_book), label: 'Browse'),
        ],
      ),
    );
  }
}