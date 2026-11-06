import 'package:flutter/material.dart';
import 'services/api_service.dart';

void main() => runApp(TeacherApp(api: ApiService()));

class TeacherApp extends StatelessWidget {
  const TeacherApp({super.key, required this.api});
  final ApiService api;

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'A/L ICT Teacher',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(colorSchemeSeed: const Color(0xFF1E7A4C), useMaterial3: true),
        home: const Scaffold(body: Center(child: Text('A/L ICT Teacher'))),
      );
}
