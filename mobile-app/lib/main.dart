import 'package:flutter/material.dart';
import 'screens/role_select_screen.dart';
import 'services/api_service.dart';

void main() => runApp(AlIctApp(api: ApiService()));

class AlIctApp extends StatelessWidget {
  const AlIctApp({super.key, required this.api});
  final ApiService api;

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'A/L ICT',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(colorSchemeSeed: const Color(0xFF1F5FBF), useMaterial3: true),
        home: RoleSelectScreen(api: api),
      );
}