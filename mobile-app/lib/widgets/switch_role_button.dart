import 'package:flutter/material.dart';
import '../screens/role_select_screen.dart';
import '../services/api_service.dart';

class SwitchRoleButton extends StatelessWidget {
  const SwitchRoleButton({super.key, required this.api});
  final ApiService api;

  @override
  Widget build(BuildContext context) => IconButton(
        tooltip: 'Switch role',
        icon: const Icon(Icons.logout),
        onPressed: () => Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => RoleSelectScreen(api: api)),
          (_) => false,
        ),
      );
}