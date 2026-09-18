import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'session_manager.dart';
import 'api_config.dart';
import 'theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey        = GlobalKey<FormState>();
  final _usernameCtrl   = TextEditingController();
  final _passwordCtrl   = TextEditingController();
  final _confirmCtrl    = TextEditingController();
  bool _isLoading       = true;
  bool _obscurePass     = true;
  bool _obscureConfirm  = true;
  bool _isSignUp        = false;
  String? _error;

  static const _features = [
    ('Customer Management', Icons.people_outline),
    ('Debt Tracking', Icons.grid_view_outlined),
    ('Risk Classification', Icons.shield_outlined),
    ('Reports & Monitoring', Icons.bar_chart_outlined),
  ];

  @override void initState() { super.initState(); _checkSetup(); }
  @override void dispose() {
    _usernameCtrl.dispose(); _passwordCtrl.dispose(); _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _checkSetup() async {
    try {
      final r = await http.get(Uri.parse('$baseUrl/api/auth/setup-required'));
      if (r.statusCode == 200) {
        final d = jsonDecode(r.body);
        setState(() { _isSignUp = d['setupRequired'] == true; _isLoading = false; });
      } else { setState(() => _isLoading = false); }
    } catch (_) { setState(() => _isLoading = false); }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_isSignUp && _passwordCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwords do not match.'); return;
    }
    setState(() { _isLoading = true; _error = null; });
    try {
        final url = Uri.parse('$baseUrl/api/login');
      final r = await http.post(url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': _usernameCtrl.text.trim(), 'password': _passwordCtrl.text}));
      final d = jsonDecode(r.body);
      if (r.statusCode == 200 || r.statusCode == 201) {
        await SessionManager.saveSession(
          token: d['token'], userId: d['user']['id'],
          username: d['user']['username'], role: d['user']['role']);
        if (mounted) Navigator.of(context).pushReplacementNamed('/home');
      } else { setState(() => _error = d['error'] ?? 'Something went wrong'); }
    } catch (_) { setState(() => _error = 'Could not connect to server.'); }
    finally { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F4F0),
      body: Column(
        children: [
          Container(
            height: 72,
            color: const Color(0xFFF5F4F0),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE6E4DE)),
                  ),
                  child: const Icon(Icons.grid_view_rounded, size: 20, color: Color(0xFF2B2B2B)),
                ),
                const SizedBox(width: 12),
                const Spacer(),
                Text(
                  'Design mobile app aesthetic',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF1F1F1F),
                  ),
                ),
                const Spacer(),
                SizedBox(
                  height: 38,
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF4F8B7C)),
                      backgroundColor: const Color(0xFF4F8B7C),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    icon: const Icon(Icons.mail_outline_rounded, size: 16),
                    label: const Text('Sign up with email'),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  height: 38,
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFD5D5D5)),
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF2B2B2B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    icon: Container(
                      width: 18,
                      height: 18,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Color(0xFFEB4335), Color(0xFFF9AB00), Color(0xFF34A853), Color(0xFF4285F4)],
                        ),
                      ),
                    ),
                    label: const Text('Continue with Google'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  flex: 5,
                  child: Container(
                    color: const Color(0xFF0F5C4E),
                  ),
                ),
                Expanded(
                  flex: 4,
                  child: Container(
                    color: const Color(0xFF0F5C4E),
                    child: Center(
                      child: SizedBox(
                        width: 420,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(28, 22, 28, 24),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF3F0EA),
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const SizedBox(height: 12),
                              Text(
                                'ListaWise',
                                style: GoogleFonts.fraunces(
                                  fontSize: 42,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF0E5A4B),
                                  letterSpacing: -1.0,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Digital Utang Management',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFF0E5A4B),
                                ),
                              ),
                              const SizedBox(height: 26),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 24),
                                child: Form(
                                  key: _formKey,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Store Owner Login',
                                        style: GoogleFonts.inter(
                                          fontSize: 34,
                                          fontWeight: FontWeight.w700,
                                          color: const Color(0xFF0E5A4B),
                                        ),
                                      ),
                                      const SizedBox(height: 22),
                                      Text(
                                        'Username',
                                        style: GoogleFonts.inter(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                          color: const Color(0xFF2F3C3A),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      TextFormField(
                                        controller: _usernameCtrl,
                                        validator: (v) => v == null || v.isEmpty ? 'Username is required' : null,
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: const Color(0xFFEEF0EC),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(12),
                                            borderSide: const BorderSide(color: Color(0xFFD8DED8)),
                                          ),
                                          enabledBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(12),
                                            borderSide: const BorderSide(color: Color(0xFFD8DED8)),
                                          ),
                                          focusedBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(12),
                                            borderSide: const BorderSide(color: Color(0xFF0E5A4B), width: 1.5),
                                          ),
                                          hintText: 'admin',
                                          hintStyle: GoogleFonts.inter(color: const Color(0xFF8B8F8E), fontSize: 16),
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                        ),
                                      ),
                                      const SizedBox(height: 18),
                                      Text(
                                        'Password',
                                        style: GoogleFonts.inter(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                          color: const Color(0xFF2F3C3A),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      TextFormField(
                                        controller: _passwordCtrl,
                                        obscureText: true,
                                        validator: (v) => v == null || v.length < 6 ? 'At least 6 characters' : null,
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: const Color(0xFFEEF0EC),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(12),
                                            borderSide: const BorderSide(color: Color(0xFFD8DED8)),
                                          ),
                                          enabledBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(12),
                                            borderSide: const BorderSide(color: Color(0xFFD8DED8)),
                                          ),
                                          focusedBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(12),
                                            borderSide: const BorderSide(color: Color(0xFF0E5A4B), width: 1.5),
                                          ),
                                          hintText: '••••',
                                          hintStyle: GoogleFonts.inter(color: const Color(0xFF8B8F8E), fontSize: 16),
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                        ),
                                      ),
                                      const SizedBox(height: 22),
                                      SizedBox(
                                        width: double.infinity,
                                        height: 52,
                                        child: ElevatedButton(
                                          onPressed: _isLoading ? null : _submit,
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF0E5A4B),
                                            foregroundColor: Colors.white,
                                            disabledBackgroundColor: const Color(0xFF7BA69B),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                            elevation: 0,
                                          ),
                                          child: _isLoading
                                              ? const SizedBox(
                                                  width: 18,
                                                  height: 18,
                                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                                )
                                              : Text(
                                                  'Sign In',
                                                  style: GoogleFonts.inter(
                                                    fontSize: 17,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                        ),
                                      ),
                                      if (_error != null) ...[
                                        const SizedBox(height: 14),
                                        Text(
                                          _error!,
                                          style: GoogleFonts.inter(color: const Color(0xFFB54848), fontSize: 13),
                                        ),
                                      ],
                                      const SizedBox(height: 18),
                                      Align(
                                        alignment: Alignment.center,
                                        child: Text(
                                          'Demo: admin / 1234',
                                          style: GoogleFonts.inter(
                                            fontSize: 13,
                                            color: const Color(0xFF60706B),
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 36),
                                      Align(
                                        alignment: Alignment.center,
                                        child: Text(
                                          'St. Mary\'s College of Tagum · CC 104',
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            color: const Color(0xFF5A635E),
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Container(
                    color: const Color(0xFF0F5C4E),
                  ),
                ),
              ],
            ),
          ),
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            color: const Color(0xFFF5F4F0),
            child: Row(
              children: [
                Expanded(
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'This website uses cookies, pixel tags, and local storage for performance, personalization, and marketing purposes. Our use of some cookies may be considered a sale, sharing for behavioral advertising, or targeted advertising. For more, see our privacy policy. California Residents can learn how personal information is collected, including how it is used, whether it is sold or "shared", and how long it is retained.',
                      style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF4B4B4B)),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                TextButton(
                  onPressed: () {},
                  style: TextButton.styleFrom(
                    backgroundColor: const Color(0xFF0F5C4E),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Opt out'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DemoRow extends StatelessWidget {
  final String role, username, password;
  const _DemoRow(this.role, this.username, this.password);
  @override
  Widget build(BuildContext context) => Row(children: [
    Text('$role: ', style: GoogleFonts.inter(fontSize: 12, color: kTextMuted)),
    Text(username, style: GoogleFonts.inter(fontSize: 12, color: kPrimary, fontWeight: FontWeight.w600)),
    Text(' / ', style: GoogleFonts.inter(fontSize: 12, color: kTextLight)),
    Text(password, style: GoogleFonts.inter(fontSize: 12, color: kPrimary, fontWeight: FontWeight.w600)),
  ]);
}

class _FormField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final bool obscure;
  final VoidCallback? onToggle;
  final String? Function(String?)? validator;
  const _FormField({required this.controller, required this.hint,
    required this.icon, this.obscure = false, this.onToggle, this.validator});
  @override
  Widget build(BuildContext context) => TextFormField(
    controller: controller, obscureText: obscure, validator: validator,
    style: GoogleFonts.inter(fontSize: 14, color: kNavy),
    decoration: InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: kTextLight, fontSize: 14),
      prefixIcon: Icon(icon, color: kTextMuted, size: 18),
      suffixIcon: onToggle != null ? IconButton(
        icon: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
          color: kTextMuted, size: 18),
        onPressed: onToggle) : null,
      filled: true, fillColor: kBg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: kBorder)),
      enabledBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: kBorder)),
      focusedBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: kPrimary, width: 1.5)),
      errorBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: Color(0xFFC45C5C))),
      focusedErrorBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: Color(0xFFC45C5C), width: 1.5)),
    ),
  );
}

class _BgCircle extends StatelessWidget {
  final double size; final Color color;
  const _BgCircle(this.size, this.color);
  @override
  Widget build(BuildContext context) => Container(width: size, height: size,
    decoration: BoxDecoration(shape: BoxShape.circle, color: color));
}
