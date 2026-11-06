class AppConfig {
  static const apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:3000/api');
  // Test teacher (Nimal Perera) until login is built in Sprint 06
  static const mockUserId = int.fromEnvironment('MOCK_USER_ID', defaultValue: 2);
}