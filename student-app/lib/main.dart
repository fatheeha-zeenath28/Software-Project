import 'package:flutter/material.dart';
import 'services/api_service.dart';

void main() => runApp(StudentApp(api: ApiService()));

class StudentApp extends StatelessWidget {
  const StudentApp({super.key, required this.api});
  final ApiService api;

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'A/L ICT',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(colorSchemeSeed: const Color(0xFF1F5FBF), useMaterial3: true),
        home: const Scaffold(body: Center(child: Text('A/L ICT Student'))),
      );
}