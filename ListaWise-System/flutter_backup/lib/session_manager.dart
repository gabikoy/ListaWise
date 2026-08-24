import 'package:shared_preferences/shared_preferences.dart';

class SessionManager {
  static const _keyToken = 'auth_token';
  static const _keyUserId = 'user_id';
  static const _keyUsername = 'username';
  static const _keyRole = 'role';

  static Future<void> saveSession({
    required String token,
    required int userId,
    required String username,
    required String role,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, token);
    await prefs.setInt(_keyUserId, userId);
    await prefs.setString(_keyUsername, username);
    await prefs.setString(_keyRole, role);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyToken);
  }

  static Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUsername);
  }

  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyRole);
  }

  static Future<int?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyUserId);
  }

  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  static Future<bool> isOwner() async {
    final role = await getRole();
    return role == 'owner';
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyToken);
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyUsername);
    await prefs.remove(_keyRole);
  }
}
