class AppConfig {
  static const apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:3000/api');

  // Test users until real login is built in Sprint 06.
  // If you see "Unknown user", check the ids in Prisma Studio (users table).
  static const teacherUserId = int.fromEnvironment('TEACHER_USER_ID', defaultValue: 2);
  static const studentUserId = int.fromEnvironment('STUDENT_USER_ID', defaultValue: 4);
}