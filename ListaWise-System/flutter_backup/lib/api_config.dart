import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' show Platform;

/// Returns the correct base URL for the current platform.
/// - Web browser    → localhost:3000
/// - Android emu    → 10.0.2.2:3000  (special alias for host machine)
/// - iOS sim/desktop → localhost:3000
String get baseUrl {
  if (kIsWeb) return 'http://localhost:3000';
  if (Platform.isAndroid) return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}
