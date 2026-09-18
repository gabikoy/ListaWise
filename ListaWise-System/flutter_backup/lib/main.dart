import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'session_manager.dart';
import 'login_screen.dart';
import 'api_config.dart';
import 'theme.dart';

void main() => runApp(const ListaWiseApp());

// ─── App ──────────────────────────────────────────────────────────────────────
class ListaWiseApp extends StatelessWidget {
  const ListaWiseApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'ListaWise', debugShowCheckedModeBanner: false,
    theme: ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: kPrimary, primary: kPrimary),
      useMaterial3: true,
      scaffoldBackgroundColor: kBg,
      textTheme: GoogleFonts.interTextTheme(),
      dialogTheme: const DialogThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        backgroundColor: kCard,
      ),
    ),
    home: const SplashGate(),
    routes: {
      '/home':  (_) => const InactivityWrapper(child: AppShell()),
      '/login': (_) => const LoginScreen(),
    },
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────
class SplashGate extends StatefulWidget {
  const SplashGate({super.key});
  @override State<SplashGate> createState() => _SplashGateState();
}
class _SplashGateState extends State<SplashGate> {
  @override void initState() { super.initState(); _check(); }
  Future<void> _check() async {
    final ok = await SessionManager.isLoggedIn();
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed(ok ? '/home' : '/login');
  }
  @override
  Widget build(BuildContext context) => const Scaffold(
    backgroundColor: kNavy,
    body: Center(child: CircularProgressIndicator(color: kAmberLight, strokeWidth: 2)),
  );
}

// ─── FR-03: Inactivity wrapper ────────────────────────────────────────────────
class InactivityWrapper extends StatefulWidget {
  final Widget child;
  const InactivityWrapper({super.key, required this.child});
  @override State<InactivityWrapper> createState() => _InactivityWrapperState();
}
class _InactivityWrapperState extends State<InactivityWrapper> {
  Timer? _timer;
  @override void initState() { super.initState(); _reset(); }
  @override void dispose() { _timer?.cancel(); super.dispose(); }
  void _reset() {
    _timer?.cancel();
    _timer = Timer(kInactivityTimeout, () async {
      await SessionManager.clearSession();
      if (mounted) Navigator.of(context).pushReplacementNamed('/login');
    });
  }
  @override
  Widget build(BuildContext context) => Listener(
    behavior: HitTestBehavior.translucent,
    onPointerDown: (_) => _reset(),
    onPointerMove: (_) => _reset(),
    child: widget.child,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
Future<Map<String, String>> _hdrs() async {
  final t = await SessionManager.getToken();
  return {'Authorization': 'Bearer $t', 'Content-Type': 'application/json'};
}
String _peso(dynamic v) {
  final a = double.tryParse(v?.toString() ?? '0') ?? 0.0;
  return '₱${a.toStringAsFixed(2)}';
}
String _date(String? s) {
  if (s == null) return '';
  try { final d = DateTime.parse(s).toLocal(); return '${d.month}/${d.day}/${d.year}'; }
  catch (_) { return s; }
}
String _initials(String n) {
  final p = n.trim().split(' ');
  return p.length >= 2 ? '${p[0][0]}${p[1][0]}'.toUpperCase()
    : n.isNotEmpty ? n[0].toUpperCase() : '?';
}

Widget _initialsBox(String name, {Color? bg, Color? fg, double size = 34}) {
  return Container(
    width: size, height: size, color: bg ?? kPrimaryLight,
    alignment: Alignment.center,
    child: Text(_initials(name),
      style: GoogleFonts.inter(color: fg ?? kPrimary, fontWeight: FontWeight.w600, fontSize: size * 0.32)),
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
Widget _riskBadge(String risk) {
  final isHigh = risk == 'HIGH';
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: isHigh ? kRedLight : kGreenLight,
      border: Border.all(color: isHigh ? const Color(0x33C45C5C) : const Color(0x333D8B7A))),
    child: Text(isHigh ? 'HIGH RISK' : 'LOW RISK',
      style: kMono(size: 9, color: isHigh ? kRed : kGreen, tracking: 1.2)),
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
class AppShell extends StatefulWidget {
  const AppShell({super.key});
  @override State<AppShell> createState() => _AppShellState();
}
class _AppShellState extends State<AppShell> {
  int _sel = 0;
  String _username = '', _role = '';
  final _pages = const [DashboardScreen(), CustomersScreen(), OverdueScreen(), RiskScreen()];
  static const _nav = [
    (Icons.grid_view_rounded, Icons.grid_view_rounded, 'Dashboard'),
    (Icons.people_alt_outlined, Icons.people_alt_rounded, 'Customers'),
    (Icons.hourglass_top_rounded, Icons.hourglass_top_rounded, 'Overdue Accounts'),
    (Icons.verified_user_outlined, Icons.verified_user_rounded, 'Risk Overview'),
  ];

  @override void initState() { super.initState(); _loadUser(); }
  Future<void> _loadUser() async {
    final u = await SessionManager.getUsername();
    final r = await SessionManager.getRole();
    if (mounted) setState(() { _username = u ?? ''; _role = r ?? ''; });
  }
  Future<void> _logout() async {
    await SessionManager.clearSession();
    if (mounted) Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 900) {
          return const _MobileAppShell();
        }
        return Scaffold(
          body: Row(children: [
            _Sidebar(selected: _sel, username: _username, role: _role,
              nav: _nav, onSelect: (i) => setState(() => _sel = i),
              onSettings: _showSettings, onLogout: _logout),
            Expanded(child: _pages[_sel]),
          ]),
        );
      },
    );
  }

  void _showSettings() {
    final currC = TextEditingController();
    final newC  = TextEditingController();
    final conC  = TextEditingController();
    String? err, ok;
    showDialog(context: context, builder: (ctx) => StatefulBuilder(
      builder: (ctx, ss) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.w700)),
        content: SizedBox(width: 360, child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Align(alignment: Alignment.centerLeft,
            child: Text('Change Password', style: TextStyle(fontSize: 13,
              fontWeight: FontWeight.w600, color: kTextMid))),
          const SizedBox(height: 12),
          _SettingsField(ctrl: currC, label: 'Current Password', obscure: true),
          const SizedBox(height: 10),
          _SettingsField(ctrl: newC, label: 'New Password', obscure: true),
          const SizedBox(height: 10),
          _SettingsField(ctrl: conC, label: 'Confirm New Password', obscure: true),
          if (err != null) ...[const SizedBox(height: 10),
            Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: kRedLight, borderRadius: BorderRadius.zero),
              child: Text(err!, style: const TextStyle(color: kRed, fontSize: 12)))],
          if (ok != null) ...[const SizedBox(height: 10),
            Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: kGreenLight, borderRadius: BorderRadius.zero),
              child: Text(ok!, style: const TextStyle(color: kGreen, fontSize: 12)))],
        ])),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: kTextMuted))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: kPrimary,
              foregroundColor: Colors.white, elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero)),
            onPressed: () async {
              if (newC.text != conC.text) { ss(() { err = 'Passwords do not match.'; ok = null; }); return; }
              final h = await _hdrs();
              final r = await http.put(Uri.parse('$baseUrl/api/auth/password'), headers: h,
                body: jsonEncode({'currentPassword': currC.text, 'newPassword': newC.text}));
              final d = jsonDecode(r.body);
              if (r.statusCode == 200) {
                ss(() { ok = 'Password updated successfully.'; err = null; });
                currC.clear(); newC.clear(); conC.clear();
              } else { ss(() { err = d['error'] ?? 'Failed'; ok = null; }); }
            },
            child: const Text('Update')),
        ],
      ),
    ));
  }
}

class _SettingsField extends StatelessWidget {
  final TextEditingController ctrl; final String label; final bool obscure;
  const _SettingsField({required this.ctrl, required this.label, this.obscure = false});
  @override
  Widget build(BuildContext context) => TextField(controller: ctrl, obscureText: obscure,
    style: kBody(size: 13, color: kNavy),
    decoration: InputDecoration(labelText: label, labelStyle: kBody(size: 12, color: kTextMuted),
      filled: true, fillColor: kBg, isDense: true,
      border: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: kBorder)),
      enabledBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: kBorder)),
      focusedBorder: const OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: kPrimary, width: 1.5))));
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
class _Sidebar extends StatelessWidget {
  final int selected;
  final String username, role;
  final List<(IconData, IconData, String)> nav;
  final void Function(int) onSelect;
  final VoidCallback onSettings, onLogout;
  const _Sidebar({required this.selected, required this.username,
    required this.role, required this.nav, required this.onSelect,
    required this.onSettings, required this.onLogout});

  @override
  Widget build(BuildContext context) => Container(
    width: 236, color: kNavy,
    child: Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(20, 28, 20, 20),
        child: Row(children: [
          Container(width: 36, height: 36, color: kPrimary,
            alignment: Alignment.center,
            child: Text('LW', style: GoogleFonts.fraunces(
              color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600, letterSpacing: -0.2))),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('ListaWise', style: GoogleFonts.fraunces(
              color: Colors.white, fontWeight: FontWeight.w500, fontSize: 16, letterSpacing: -0.3)),
            Text('RECOVERY LEDGER', style: kMono(size: 8, color: const Color(0x88FFFFFF), tracking: 1.6)),
          ]),
        ])),

      Container(height: 1, color: Colors.white.withOpacity(0.08),
        margin: const EdgeInsets.symmetric(horizontal: 16)),
      const SizedBox(height: 16),

      Padding(padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
        child: Align(alignment: Alignment.centerLeft,
          child: Text('MAIN MENU', style: kMono(size: 9, color: const Color(0x88FFFFFF), tracking: 1.8)))),

      Expanded(child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        itemCount: nav.length,
        itemBuilder: (_, i) {
          final active = selected == i;
          return GestureDetector(
            onTap: () => onSelect(i),
            child: Container(
              margin: const EdgeInsets.only(bottom: 2),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
              color: active ? kPrimary : Colors.transparent,
              child: Row(children: [
                Icon(active ? nav[i].$2 : nav[i].$1,
                  color: active ? Colors.white : const Color(0x99A8AED8), size: 16),
                const SizedBox(width: 10),
                Text(nav[i].$3, style: GoogleFonts.inter(
                  color: active ? Colors.white : const Color(0xB3C5C9E8),
                  fontSize: 13, fontWeight: active ? FontWeight.w500 : FontWeight.w400, letterSpacing: 0.2)),
              ]),
            ),
          );
        },
      )),

      Container(
        padding: const EdgeInsets.all(12),
        child: Column(children: [
          Container(height: 1, color: Colors.white.withOpacity(0.08),
            margin: const EdgeInsets.only(bottom: 12)),
          _SidebarBtn(Icons.settings_outlined, 'Settings', onSettings),
          const SizedBox(height: 2),
          _SidebarBtn(Icons.logout_rounded, 'Log Out', onLogout, isLogout: true),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            color: Colors.white.withOpacity(0.06),
            child: Row(children: [
              _initialsBox(username, bg: kPrimary, fg: Colors.white, size: 32),
              const SizedBox(width: 8),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(username, style: GoogleFonts.inter(color: Colors.white,
                  fontSize: 12, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
                Text(role.toUpperCase(), style: kMono(size: 8, color: const Color(0x88FFFFFF), tracking: 1.2)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                color: kAmber.withOpacity(0.18),
                child: Text('ONLINE', style: kMono(size: 8, color: kAmberLight, tracking: 1.0))),
            ]),
          ),
        ]),
      ),
    ]),
  );
}

class _SidebarBtn extends StatelessWidget {
  final IconData icon; final String label;
  final VoidCallback onTap; final bool isLogout;
  const _SidebarBtn(this.icon, this.label, this.onTap, {this.isLogout = false});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      child: Row(children: [
        Icon(icon, size: 15,
          color: isLogout ? const Color(0xFFE8A0A0) : const Color(0x99A8AED8)),
        const SizedBox(width: 10),
        Text(label, style: GoogleFonts.inter(fontSize: 12,
          color: isLogout ? const Color(0xFFE8A0A0) : const Color(0xB3C5C9E8))),
      ]),
    ),
  );
}

class _MobileAppShell extends StatefulWidget {
  const _MobileAppShell();

  @override
  State<_MobileAppShell> createState() => _MobileAppShellState();
}

class _MobileAppShellState extends State<_MobileAppShell> {
  int _index = 0;

  final _screens = const [
    _MobileHomeScreen(),
    _MobileCustomersScreen(),
    _MobileReportScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF5A5A5A),
      body: Center(
        child: Container(
          width: 390,
          height: 820,
          decoration: BoxDecoration(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(42),
            boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 20, offset: Offset(0, 10))],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(42),
            child: Scaffold(
              backgroundColor: const Color(0xFF0F5C4E),
              body: _screens[_index],
              bottomNavigationBar: Container(
                height: 78,
                color: const Color(0xFFF6F1EA),
                padding: const EdgeInsets.only(top: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _BottomNavItem(
                      icon: Icons.home_rounded,
                      label: 'Home',
                      active: _index == 0,
                      onTap: () => setState(() => _index = 0),
                    ),
                    _BottomNavItem(
                      icon: Icons.people_alt_rounded,
                      label: 'Customers',
                      active: _index == 1,
                      onTap: () => setState(() => _index = 1),
                    ),
                    _BottomNavItem(
                      icon: Icons.bar_chart_rounded,
                      label: 'Reports',
                      active: _index == 2,
                      onTap: () => setState(() => _index = 2),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BottomNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _BottomNavItem({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? const Color(0xFF0F5C4E) : const Color(0xFF6E7975);
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 90,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 28, color: color),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
            if (active)
              Container(
                margin: const EdgeInsets.only(top: 2),
                width: 30,
                height: 2,
                color: const Color(0xFF0F5C4E),
              ),
          ],
        ),
      ),
    );
  }
}

class _MobileHomeScreen extends StatelessWidget {
  const _MobileHomeScreen();

  @override
  Widget build(BuildContext context) {
    final customers = [
      {'name': 'Lita Cruz', 'days': 92, 'risk': 'High Risk', 'balance': 670.00, 'short': 'LC'},
      {'name': 'Maria Santos', 'days': 71, 'risk': 'High Risk', 'balance': 485.00, 'short': 'MS'},
      {'name': 'Ana Flores', 'days': 53, 'risk': 'Low Risk', 'balance': 340.00, 'short': 'AF'},
    ];

    return Container(
      color: const Color(0xFF0F5C4E),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              const SizedBox(height: 8),
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      '9:41',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Container(
                    width: 38,
                    height: 22,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                ],
              ),
              const SizedBox(height: 18),
              Align(
                alignment: Alignment.centerLeft,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Thursday, August 20',
                      style: TextStyle(color: Color(0xFFE3E9E6), fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Good day, Admin!',
                      style: GoogleFonts.fraunces(
                        fontSize: 40,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Here\'s your store\'s credit overview',
                      style: TextStyle(color: Color(0xFFD9E7E2), fontSize: 14),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F0EC),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'TOTAL OUTSTANDING UTANG',
                      style: TextStyle(fontSize: 12, color: Color(0xFF59655E), letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      '₱1,820.00',
                      style: GoogleFonts.fraunces(
                        fontSize: 38,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF0D5D49),
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Across 5 customers',
                      style: TextStyle(color: Color(0xFF3B534E), fontSize: 14),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1D8D8),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Icon(Icons.warning_amber_rounded, color: Color(0xFFDA5E5E), size: 18),
                          SizedBox(height: 20),
                          Text('2', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, color: Color(0xFF0D5D49))),
                          Text('customers', style: TextStyle(color: Color(0xFF4F5F5B), fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5EBDD),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Icon(Icons.watch_later_outlined, color: Color(0xFFB77C2B), size: 18),
                          SizedBox(height: 20),
                          Text('4', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, color: Color(0xFF0D5D49))),
                          Text('>30 days unpaid', style: TextStyle(color: Color(0xFF4F5F5B), fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Align(
                alignment: Alignment.centerLeft,
                child: Row(
                  children: [
                    const Text(
                      'Priority Collections',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () {},
                      child: const Text('See all →', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.separated(
                  itemCount: customers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = customers[index];
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF2F0EC),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8E1DA),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Center(
                              child: Text(
                                item['short'] as String,
                                style: const TextStyle(color: Color(0xFF0D5D49), fontWeight: FontWeight.w700),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['name'] as String,
                                  style: const TextStyle(color: Color(0xFF1E2E2B), fontSize: 16, fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  '${item['days']} days overdue',
                                  style: const TextStyle(color: Color(0xFF63756E), fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '₱${(item['balance'] as double).toStringAsFixed(2)}',
                            style: const TextStyle(color: Color(0xFF0D5D49), fontWeight: FontWeight.w700, fontSize: 18),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF7D9D9),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              item['risk'] as String,
                              style: const TextStyle(color: Color(0xFFDA5E5E), fontSize: 10, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MobileCustomersScreen extends StatelessWidget {
  const _MobileCustomersScreen();

  @override
  Widget build(BuildContext context) {
    final customers = [
      {'name': 'Lita Cruz', 'days': 92, 'risk': 'High Risk', 'balance': 670.00, 'short': 'LC'},
      {'name': 'Maria Santos', 'days': 71, 'risk': 'High Risk', 'balance': 485.00, 'short': 'MS'},
      {'name': 'Ana Flores', 'days': 53, 'risk': 'Low Risk', 'balance': 340.00, 'short': 'AF'},
      {'name': 'Jose Reyes', 'days': 46, 'risk': 'Low Risk', 'balance': 230.00, 'short': 'JR'},
      {'name': 'Danny Villanueva', 'days': 10, 'risk': 'Low Risk', 'balance': 95.00, 'short': 'DV'},
    ];

    return Container(
      color: const Color(0xFF0F5C4E),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              const SizedBox(height: 10),
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      '9:41',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Container(width: 38, height: 22, decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(12))),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                ],
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Customers', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w700)),
                        SizedBox(height: 4),
                        Text('5 registered', style: TextStyle(color: Color(0xFFD7E7E1), fontSize: 15)),
                      ],
                    ),
                  ),
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE7C57A),
                      borderRadius: BorderRadius.circular(26),
                    ),
                    child: const Icon(Icons.add, size: 32, color: Color(0xFF0F5C4E)),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFECE7E0),
                  borderRadius: BorderRadius.circular(28),
                ),
                child: const TextField(
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Search customer...',
                    hintStyle: TextStyle(color: Color(0xFF6C7571), fontSize: 16),
                    icon: Icon(Icons.search, color: Color(0xFF0F5C4E)),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  _FilterChip(label: 'All', active: true),
                  const SizedBox(width: 10),
                  _FilterChip(label: 'High Risk', active: false),
                  const SizedBox(width: 10),
                  _FilterChip(label: 'Low Risk', active: false),
                ],
              ),
              const SizedBox(height: 18),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFEAE3),
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
                  ),
                  child: ListView.separated(
                    itemCount: customers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = customers[index];
                      final isHigh = item['risk'] == 'High Risk';
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        decoration: BoxDecoration(
                          color: isHigh ? const Color(0xFFF3E2E0) : const Color(0xFFECF2EE),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: isHigh ? const Color(0xFFE8CBC7) : const Color(0xFFD8E7DE),
                                borderRadius: BorderRadius.circular(21),
                              ),
                              child: Center(
                                child: Text(item['short'] as String, style: const TextStyle(color: Color(0xFF0F5C4E), fontWeight: FontWeight.w700)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item['name'] as String, style: const TextStyle(fontSize: 16, color: Color(0xFF1B1B1B), fontWeight: FontWeight.w700)),
                                  Text('${item['days']} days • ${item['days']} transactions', style: const TextStyle(fontSize: 12, color: Color(0xFF69766F))),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '₱${(item['balance'] as double).toStringAsFixed(2)}',
                              style: const TextStyle(color: Color(0xFF1B1B1B), fontSize: 16, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(width: 10),
                            const Icon(Icons.warning_amber_rounded, color: Color(0xFFDA5E5E), size: 18),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool active;

  const _FilterChip({required this.label, required this.active});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      decoration: BoxDecoration(
        color: active ? const Color(0xFF0F5C4E) : const Color(0xFFDCF0E8),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: active ? Colors.white : const Color(0xFF0F5C4E),
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _MobileReportScreen extends StatelessWidget {
  const _MobileReportScreen();

  @override
  Widget build(BuildContext context) {
    final customers = [
      {'name': 'Lita Cruz', 'risk': 'High Risk', 'balance': 670.00},
      {'name': 'Maria Santos', 'risk': 'High Risk', 'balance': 485.00},
      {'name': 'Ana Flores', 'risk': 'Low Risk', 'balance': 340.00},
    ];

    return Container(
      color: const Color(0xFF0F5C4E),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              const SizedBox(height: 8),
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      '9:41',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Container(width: 38, height: 22, decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(12))),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                  const SizedBox(width: 8),
                  const Icon(Icons.circle, size: 8, color: Colors.white),
                ],
              ),
              const SizedBox(height: 24),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Summary Report',
                  style: GoogleFonts.fraunces(
                    fontSize: 34,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: -1,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text('As of August 20, 2026', style: TextStyle(color: Color(0xFFDBE9E5), fontSize: 14)),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF2F0EC),
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(22), topRight: Radius.circular(22)),
                  ),
                  child: ListView(
                    children: [
                      const Text('OVERALL SUMMARY', style: TextStyle(fontSize: 12, color: Color(0xFF596C66), letterSpacing: 1.6)),
                      const SizedBox(height: 18),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('Total Outstanding Utang', style: TextStyle(color: Color(0xFF1F2D2A), fontSize: 16)),
                          Text('₱1,820.00', style: TextStyle(color: Color(0xFF1F2D2A), fontSize: 18, fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('Total Customers', style: TextStyle(color: Color(0xFF1F2D2A), fontSize: 16)),
                          Text('5', style: TextStyle(color: Color(0xFF1F2D2A), fontSize: 18, fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('High Risk Accounts', style: TextStyle(color: Color(0xFF1F2D2A), fontSize: 16)),
                          Text('2', style: TextStyle(color: Color(0xFFDA5E5E), fontSize: 18, fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('Overdue >30 days', style: TextStyle(color: Color(0xFF1F2D2A), fontSize: 16)),
                          Text('4', style: TextStyle(color: Color(0xFFDA5E5E), fontSize: 18, fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 22),
                      const Text('RISK DISTRIBUTION', style: TextStyle(fontSize: 12, color: Color(0xFF596C66), letterSpacing: 1.6)),
                      const SizedBox(height: 12),
                      Container(
                        height: 18,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0F0F0),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: const [
                            Expanded(child: SizedBox(height: 18, child: DecoratedBox(decoration: BoxDecoration(color: Color(0xFFDA5E5E), borderRadius: BorderRadius.only(topLeft: Radius.circular(12), bottomLeft: Radius.circular(12)))))),
                            Expanded(child: SizedBox(height: 18, child: DecoratedBox(decoration: BoxDecoration(color: Color(0xFF68B48F), borderRadius: BorderRadius.only(topRight: Radius.circular(12), bottomRight: Radius.circular(12)))))),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('High Risk: 2', style: TextStyle(color: Color(0xFFDA5E5E), fontWeight: FontWeight.w700, fontSize: 14)),
                          Text('Low Risk: 3', style: TextStyle(color: Color(0xFF2F8B6B), fontWeight: FontWeight.w700, fontSize: 14)),
                        ],
                      ),
                      const SizedBox(height: 22),
                      const Text('Top Outstanding Balances', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1F2D2A))),
                      const SizedBox(height: 12),
                      ...customers.map((customer) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Text('${customer['name']}'.substring(0, 1).toUpperCase(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2D2A))),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(customer['name'] as String, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1F2D2A))),
                                  Text('92 days overdue', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7772))),
                                ],
                              ),
                            ),
                            Text('₱${(customer['balance'] as double).toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, color: Color(0xFF1F2D2A), fontWeight: FontWeight.w700)),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: customer['risk'] == 'High Risk' ? const Color(0xFFF5D7D7) : const Color(0xFFDAF0E3),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                customer['risk'] as String,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: customer['risk'] == 'High Risk' ? const Color(0xFFDA5E5E) : const Color(0xFF2F8B6B),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
class _PageWrap extends StatelessWidget {
  final String title, subtitle;
  final List<Widget> children;
  final Widget? action;
  const _PageWrap({required this.title, required this.subtitle,
    required this.children, this.action});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(32, 28, 32, 28),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: kDisplay(size: 32)),
          const SizedBox(height: 6),
          Text(subtitle, style: kBody(size: 13, color: kTextMuted)),
        ])),
        if (action != null) action!,
      ]),
      const SizedBox(height: 24),
      ...children,
    ]),
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
class _KpiCard extends StatelessWidget {
  final String label, value; final String? sub;
  final Color accent; final IconData icon;
  const _KpiCard({required this.label, required this.value,
    this.sub, required this.accent, required this.icon});
  @override
  Widget build(BuildContext context) => Expanded(child: Container(
    padding: const EdgeInsets.all(22),
    margin: const EdgeInsets.only(right: 14),
    decoration: BoxDecoration(color: kCard,
      border: Border.all(color: kBorder),
      boxShadow: [BoxShadow(color: kNavy.withOpacity(0.06),
        blurRadius: 18, offset: const Offset(0, 4))]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label.toUpperCase(), style: kMono(size: 9, color: kTextMuted, tracking: 1.4)),
        Icon(icon, color: accent, size: 16),
      ]),
      const SizedBox(height: 10),
      Text(value, style: kDisplay(size: 26, color: kNavy)),
      if (sub != null) ...[const SizedBox(height: 6),
        Text(sub!, style: kBody(size: 11, color: kTextMuted))],
    ]),
  ));
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override State<DashboardScreen> createState() => _DashboardState();
}
class _DashboardState extends State<DashboardScreen> {
  Map<String, dynamic>? _d; bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await http.get(Uri.parse('$baseUrl/api/dashboard'), headers: await _hdrs());
      if (r.statusCode == 200) setState(() { _d = jsonDecode(r.body); _loading = false; });
      else setState(() => _loading = false);
    } catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    if (_loading) return const Center(child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2));
    return RefreshIndicator(onRefresh: _load, child: ListView(
      padding: const EdgeInsets.all(28),
      children: [
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('PLATFORM', style: kMono(size: 10, tracking: 2.0)),
            const SizedBox(height: 8),
            Text('Dashboard', style: kDisplay(size: 36)),
            const SizedBox(height: 6),
            Text('Real-time ledger · ${now.month}/${now.day}/${now.year}',
              style: kBody(size: 13, color: kTextMuted)),
          ])),
          _RefreshBtn(onTap: _load),
        ]),
        const SizedBox(height: 22),
        Row(children: [
          _KpiCard(label: 'Total Outstanding', value: _peso(_d?['totalOutstanding'] ?? 0),
            sub: '${_d?['activeCustomers'] ?? 0} active accounts',
            accent: kPrimary, icon: Icons.account_balance_wallet_outlined),
          _KpiCard(label: 'Customers', value: '${_d?['totalCustomers'] ?? 0}',
            sub: 'registered in system', accent: kNavy, icon: Icons.people_alt_outlined),
          _KpiCard(label: 'Overdue (30+ days)', value: '${_d?['overdueCount'] ?? 0}',
            sub: 'need follow-up', accent: kAmber, icon: Icons.hourglass_top_rounded),
          _KpiCard(label: 'High Risk', value: '${_d?['highRiskCount'] ?? 0}',
            sub: 'rule-based flagged', accent: kRed, icon: Icons.warning_amber_rounded),
        ]),
        const SizedBox(height: 24),
        _SectionCard(
          title: 'Longest-Outstanding Balances',
          subtitle: 'Sorted by oldest unpaid debt — highest priority',
          child: (_d?['longestOutstanding'] as List? ?? []).isEmpty
            ? _EmptyState(Icons.check_circle_outline_rounded, 'No outstanding balances', '')
            : Column(children: (_d!['longestOutstanding'] as List)
                .map((c) => _OutstandingRow(c: c)).toList())),
      ],
    ));
  }
}

class _RefreshBtn extends StatelessWidget {
  final VoidCallback onTap;
  const _RefreshBtn({required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
        border: Border.all(color: kBorder)),
      child: const Icon(Icons.refresh_rounded, size: 16, color: kTextMuted)),
  );
}

class _SectionCard extends StatelessWidget {
  final String title, subtitle; final Widget child;
  const _SectionCard({required this.title, required this.subtitle, required this.child});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
      border: Border.all(color: kBorder),
      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03),
        blurRadius: 8, offset: const Offset(0, 2))]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: kDisplay(size: 22)),
      const SizedBox(height: 4),
      Text(subtitle, style: kBody(size: 12, color: kTextMuted)),
      const SizedBox(height: 16),
      child,
    ]),
  );
}

class _OutstandingRow extends StatelessWidget {
  final Map<String, dynamic> c;
  const _OutstandingRow({required this.c});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(vertical: 12),
    decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF3F4F6)))),
    child: Row(children: [
      _initialsBox(c['name'] ?? ''),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(c['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600,
          fontSize: 13, color: kTextDark)),
        Row(children: [
          const Icon(Icons.schedule_rounded, size: 11, color: kTextLight),
          const SizedBox(width: 3),
          Text('${c['days_outstanding']} days outstanding',
            style: const TextStyle(fontSize: 11, color: kTextMuted)),
          const SizedBox(width: 8),
          _riskBadge(c['risk'] ?? 'LOW'),
        ]),
      ])),
      Text(_peso(c['balance']),
        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: kRed)),
    ]),
  );
}

class _EmptyState extends StatelessWidget {
  final IconData icon; final String title, sub;
  const _EmptyState(this.icon, this.title, this.sub);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 24),
    child: Center(child: Column(children: [
      Icon(icon, size: 40, color: kTextLight),
      const SizedBox(height: 8),
      Text(title, style: const TextStyle(fontWeight: FontWeight.w600,
        color: kTextMid, fontSize: 14)),
      if (sub.isNotEmpty) ...[const SizedBox(height: 4),
        Text(sub, style: const TextStyle(color: kTextMuted, fontSize: 12))],
    ])),
  );
}

// ─── Customers ────────────────────────────────────────────────────────────────
class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});
  @override State<CustomersScreen> createState() => _CustomersState();
}
class _CustomersState extends State<CustomersScreen> {
  List _all = [], _filtered = []; bool _loading = true, _isOwner = false;
  final _q = TextEditingController();
  @override void initState() { super.initState(); _load(); _q.addListener(_filter); }
  @override void dispose() { _q.dispose(); super.dispose(); }
  void _filter() { final q = _q.text.toLowerCase();
    setState(() => _filtered = q.isEmpty ? _all
      : _all.where((c) => c['name'].toString().toLowerCase().contains(q)).toList()); }
  Future<void> _load() async {
    _isOwner = await SessionManager.isOwner();
    setState(() => _loading = true);
    try {
      final r = await http.get(Uri.parse('$baseUrl/api/customers'), headers: await _hdrs());
      if (r.statusCode == 200) setState(() { _all = jsonDecode(r.body); _filtered = _all; _loading = false; });
      else setState(() => _loading = false);
    } catch (_) { setState(() => _loading = false); }
  }

  Future<void> _add() async {
    final nC = TextEditingController(), pC = TextEditingController(), aC = TextEditingController();
    final ok = await _dialog('Add Customer', nC, pC, aC);
    if (ok == true && nC.text.trim().isNotEmpty) {
      await http.post(Uri.parse('$baseUrl/api/customers'), headers: await _hdrs(),
        body: jsonEncode({'name': nC.text.trim(), 'phone': pC.text.trim(), 'address': aC.text.trim()}));
      await _load();
    }
  }

  Future<void> _edit(Map c) async {
    final nC = TextEditingController(text: c['name']);
    final pC = TextEditingController(text: c['phone'] ?? '');
    final aC = TextEditingController(text: c['address'] ?? '');
    final ok = await _dialog('Edit Customer', nC, pC, aC);
    if (ok == true && nC.text.trim().isNotEmpty) {
      await http.put(Uri.parse('$baseUrl/api/customers/${c['id']}'), headers: await _hdrs(),
        body: jsonEncode({'name': nC.text.trim(), 'phone': pC.text.trim(), 'address': aC.text.trim()}));
      await _load();
    }
  }

  Future<bool?> _dialog(String title, TextEditingController n, TextEditingController p, TextEditingController a) =>
    showDialog<bool>(context: context, builder: (_) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
      content: SizedBox(width: 360, child: Column(mainAxisSize: MainAxisSize.min, children: [
        _SettingsField(ctrl: n, label: 'Full Name *'),
        const SizedBox(height: 10),
        _SettingsField(ctrl: p, label: 'Phone (optional)'),
        const SizedBox(height: 10),
        _SettingsField(ctrl: a, label: 'Address (optional)'),
      ])),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel', style: TextStyle(color: kTextMuted))),
        ElevatedButton(onPressed: () => Navigator.pop(context, true),
          style: ElevatedButton.styleFrom(backgroundColor: kPrimary,
            foregroundColor: Colors.white, elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero)),
          child: Text(title.startsWith('Edit') ? 'Save' : 'Add')),
      ]));

  Future<void> _delete(int id, String name) async {
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      title: const Text('Delete Customer', style: TextStyle(fontWeight: FontWeight.w700)),
      content: Text('Delete "$name"? All debt and payment records will be permanently removed.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel', style: TextStyle(color: kTextMuted))),
        ElevatedButton(onPressed: () => Navigator.pop(context, true),
          style: ElevatedButton.styleFrom(backgroundColor: kRed,
            foregroundColor: Colors.white, elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero)),
          child: const Text('Delete')),
      ]));
    if (ok == true) {
      await http.delete(Uri.parse('$baseUrl/api/customers/$id'), headers: await _hdrs());
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) => _PageWrap(
    title: 'Customers', subtitle: 'Manage and search customer records',
    action: _PrimaryBtn(label: 'Add Customer', icon: Icons.person_add_alt_1_rounded, onTap: _add),
    children: [
      // Search bar
      Container(
        decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
          border: Border.all(color: kBorder)),
        child: TextField(controller: _q,
          style: const TextStyle(fontSize: 13),
          decoration: const InputDecoration(
            hintText: 'Search by name...', hintStyle: TextStyle(color: kTextLight, fontSize: 13),
            prefixIcon: Icon(Icons.search_rounded, color: kTextLight, size: 18),
            border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 12)))),
      const SizedBox(height: 14),
      // Table header
      Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.zero, border: Border.all(color: kBorder)),
        child: const Row(children: [
          Expanded(flex: 3, child: _TH('CUSTOMER')),
          Expanded(flex: 2, child: _TH('PHONE')),
          Expanded(flex: 2, child: _TH('BALANCE')),
          Expanded(flex: 2, child: _TH('RISK STATUS')),
          Expanded(flex: 1, child: _TH('')),
        ])),
      const SizedBox(height: 6),
      Expanded(child: _loading
        ? const Center(child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2))
        : _filtered.isEmpty
          ? _EmptyState(Icons.people_outline_rounded,
              _q.text.isEmpty ? 'No customers yet' : 'No results found',
              _q.text.isEmpty ? 'Tap Add Customer to get started' : 'Try a different search term')
          : ListView.builder(itemCount: _filtered.length, itemBuilder: (_, i) {
              final c = _filtered[i];
              final bal = double.tryParse(c['balance'].toString()) ?? 0.0;
              final risk = c['risk'] ?? 'NONE';
              return GestureDetector(
                onTap: () async {
                  await Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => CustomerDetailScreen(
                      customerId: c['id'], customerName: c['name'])));
                  _load();
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                  decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
                    border: Border.all(color: kBorder),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02),
                      blurRadius: 4, offset: const Offset(0,1))]),
                  child: Row(children: [
                    Expanded(flex: 3, child: Row(children: [
                      _initialsBox(c['name']),
                      const SizedBox(width: 10),
                      Expanded(child: Text(c['name'],
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: kTextDark),
                        overflow: TextOverflow.ellipsis)),
                    ])),
                    Expanded(flex: 2, child: Text(
                      c['phone']?.toString().isNotEmpty == true ? c['phone'] : '—',
                      style: const TextStyle(fontSize: 13, color: kTextMuted))),
                    Expanded(flex: 2, child: Text(_peso(bal),
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13,
                        color: bal > 0 ? kRed : kGreen))),
                    Expanded(flex: 2, child: risk == 'NONE'
                      ? const Text('—', style: TextStyle(color: kTextLight))
                      : _riskBadge(risk)),
                    Expanded(flex: 1, child: Row(mainAxisSize: MainAxisSize.min, children: [
                      if (_isOwner) _IconBtn(Icons.edit_outlined, kPrimary, () => _edit(c)),
                      if (_isOwner) _IconBtn(Icons.delete_outline_rounded, kRed, () => _delete(c['id'], c['name'])),
                    ])),
                  ]),
                ),
              );
            })),
    ]);
}

class _TH extends StatelessWidget {
  final String t; const _TH(this.t);
  @override
  Widget build(BuildContext context) => Text(t, style: kMono(size: 9, color: kTextMuted, tracking: 1.4));
}

class _IconBtn extends StatelessWidget {
  final IconData icon; final Color color; final VoidCallback onTap;
  const _IconBtn(this.icon, this.color, this.onTap);
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(margin: const EdgeInsets.only(right: 4), padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.zero),
      child: Icon(icon, color: color, size: 14)));
}

class _PrimaryBtn extends StatelessWidget {
  final String label; final IconData icon; final VoidCallback onTap;
  const _PrimaryBtn({required this.label, required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => ElevatedButton.icon(
    onPressed: onTap, icon: Icon(icon, size: 15), label: Text(label),
    style: ElevatedButton.styleFrom(backgroundColor: kPrimary,
      foregroundColor: Colors.white, elevation: 0,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      textStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, letterSpacing: 0.6)));
}

// ─── Overdue ──────────────────────────────────────────────────────────────────
class OverdueScreen extends StatefulWidget {
  const OverdueScreen({super.key});
  @override State<OverdueScreen> createState() => _OverdueState();
}
class _OverdueState extends State<OverdueScreen> {
  List _items = []; bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await http.get(Uri.parse('$baseUrl/api/overdue'), headers: await _hdrs());
      if (r.statusCode == 200) setState(() { _items = jsonDecode(r.body); _loading = false; });
      else setState(() => _loading = false);
    } catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) => _PageWrap(
    title: 'Overdue Accounts',
    subtitle: 'Customers with debt outstanding for 30+ days',
    children: [Expanded(child: _loading
      ? const Center(child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2))
      : _items.isEmpty
        ? _EmptyState(Icons.check_circle_outline_rounded,
            'No overdue accounts', 'All debts are within 30 days')
        : RefreshIndicator(onRefresh: _load, child: ListView.builder(
            itemCount: _items.length,
            itemBuilder: (_, i) {
              final c = _items[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
                  border: Border.all(color: kBorder),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02),
                    blurRadius: 6, offset: const Offset(0,2))]),
                child: Row(children: [
                  _initialsBox(c['name'] ?? '', bg: kRedLight, fg: kRed, size: 40),
                  const SizedBox(width: 14),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(c['name'] ?? '', style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14, color: kTextDark)),
                    Row(children: [
                      const Icon(Icons.schedule_rounded, size: 11, color: kTextLight),
                      const SizedBox(width: 3),
                      Text('${c['days_outstanding']} days outstanding',
                        style: const TextStyle(fontSize: 12, color: kTextMuted)),
                    ]),
                  ])),
                  _riskBadge(c['risk'] ?? 'HIGH'),
                  const SizedBox(width: 16),
                  Text(_peso(c['balance']),
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: kRed)),
                ]));
            })))]);
}

// ─── Risk Overview ────────────────────────────────────────────────────────────
class RiskScreen extends StatefulWidget {
  const RiskScreen({super.key});
  @override State<RiskScreen> createState() => _RiskState();
}
class _RiskState extends State<RiskScreen> {
  List _items = []; bool _loading = true;
  @override void initState() { super.initState(); _load(); }
  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await http.get(Uri.parse('$baseUrl/api/risk'), headers: await _hdrs());
      if (r.statusCode == 200) setState(() { _items = jsonDecode(r.body); _loading = false; });
      else setState(() => _loading = false);
    } catch (_) { setState(() => _loading = false); }
  }
  @override
  Widget build(BuildContext context) {
    final high = _items.where((c) => c['risk'] == 'HIGH').toList();
    final low  = _items.where((c) => c['risk'] == 'LOW').toList();
    return _PageWrap(
      title: 'Risk Overview', subtitle: 'AI-classified customer risk based on payment behavior',
      children: [
        Row(children: [
          _RiskKpi('High Risk', '${high.length}', kRed, Icons.warning_amber_rounded),
          const SizedBox(width: 14),
          _RiskKpi('Low Risk', '${low.length}', kGreen, Icons.check_circle_outline_rounded),
          const SizedBox(width: 14),
          _RiskKpi('With Balance', '${_items.length}', kPrimary, Icons.account_balance_wallet_outlined),
        ]),
        const SizedBox(height: 20),
        Expanded(child: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2))
          : _items.isEmpty
            ? _EmptyState(Icons.verified_user_rounded, 'No outstanding balances', '')
            : RefreshIndicator(onRefresh: _load, child: ListView(children: [
                if (high.isNotEmpty) ...[_RiskGroupLabel('HIGH RISK', kRed),
                  ...high.map((c) => _RiskRow(c: c))],
                if (low.isNotEmpty) ...[_RiskGroupLabel('LOW RISK', kGreen),
                  ...low.map((c) => _RiskRow(c: c))],
              ]))),
      ]);
  }
}

Widget _RiskGroupLabel(String label, Color color) => Padding(
  padding: const EdgeInsets.symmetric(vertical: 10),
  child: Row(children: [
    Container(width: 3, height: 14, decoration: BoxDecoration(
      color: color, borderRadius: BorderRadius.zero)),
    const SizedBox(width: 8),
    Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800,
      color: color, letterSpacing: 1.2)),
  ]));

class _RiskKpi extends StatelessWidget {
  final String label, value; final Color color; final IconData icon;
  const _RiskKpi(this.label, this.value, this.color, this.icon);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
      border: Border.all(color: kBorder)),
    child: Row(children: [
      Icon(icon, color: color, size: 18),
      const SizedBox(width: 10),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
        Text(label, style: const TextStyle(fontSize: 11, color: kTextMuted)),
      ]),
    ]));
}

class _RiskRow extends StatelessWidget {
  final Map c; const _RiskRow({required this.c});
  @override
  Widget build(BuildContext context) {
    final isHigh = c['risk'] == 'HIGH';
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
        border: Border.all(color: isHigh ? const Color(0xFFFFE4E6) : const Color(0xFFD1FAE5)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02),
          blurRadius: 4, offset: const Offset(0,1))]),
      child: Row(children: [
        _initialsBox(c['name'] ?? '',
          bg: isHigh ? kRedLight : kGreenLight, fg: isHigh ? kRed : kGreen),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(c['name'] ?? '', style: const TextStyle(
            fontWeight: FontWeight.w600, fontSize: 13, color: kTextDark)),
          Row(children: [
            const Icon(Icons.schedule_rounded, size: 11, color: kTextLight),
            const SizedBox(width: 3),
            Text('${c['days_outstanding']} days outstanding',
              style: const TextStyle(fontSize: 11, color: kTextMuted)),
          ]),
        ])),
        _riskBadge(c['risk'] ?? 'LOW'),
        const SizedBox(width: 12),
        Text(_peso(c['balance']),
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14,
            color: isHigh ? kRed : kGreen)),
      ]));
  }
}

// ─── Customer Detail ──────────────────────────────────────────────────────────
class CustomerDetailScreen extends StatefulWidget {
  final int customerId; final String customerName;
  const CustomerDetailScreen({super.key, required this.customerId, required this.customerName});
  @override State<CustomerDetailScreen> createState() => _CustomerDetailState();
}
class _CustomerDetailState extends State<CustomerDetailScreen>
    with SingleTickerProviderStateMixin {
  Map<String, dynamic>? _d; bool _loading = true, _isOwner = false;
  late TabController _tabs;
  @override void initState() { super.initState(); _tabs = TabController(length: 3, vsync: this); _load(); }
  @override void dispose() { _tabs.dispose(); super.dispose(); }

  Future<void> _load() async {
    _isOwner = await SessionManager.isOwner();
    setState(() => _loading = true);
    try {
      final r = await http.get(Uri.parse('$baseUrl/api/customers/${widget.customerId}'), headers: await _hdrs());
      if (r.statusCode == 200) setState(() { _d = jsonDecode(r.body); _loading = false; });
      else setState(() => _loading = false);
    } catch (_) { setState(() => _loading = false); }
  }

  Future<void> _addDebt() async {
    if (_d?['risk'] == 'HIGH') {
      final go = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        title: Row(children: const [Icon(Icons.warning_amber_rounded, color: kOrange, size: 20),
          SizedBox(width: 8), Text('High-Risk Warning', style: TextStyle(fontWeight: FontWeight.w700))]),
        content: Text('${widget.customerName} is flagged HIGH RISK with ${_d?['days_outstanding'] ?? 0} days outstanding. Proceed with adding debt?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel', style: TextStyle(color: kTextMuted))),
          ElevatedButton(onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: kRed,
              foregroundColor: Colors.white, elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero)),
            child: const Text('Proceed')),
        ]));
      if (go != true) return;
    }
    final aC = TextEditingController(), dC = TextEditingController();
    final ok = await _txDialog('Add Debt', aC, dC, isDebt: true);
    if (ok == true && aC.text.isNotEmpty) {
      await http.post(Uri.parse('$baseUrl/api/customers/${widget.customerId}/debts'), headers: await _hdrs(),
        body: jsonEncode({'amount': double.tryParse(aC.text) ?? 0, 'description': dC.text.trim()}));
      await _load();
    }
  }

  Future<void> _addPayment() async {
    final aC = TextEditingController(), nC = TextEditingController();
    final ok = await _txDialog('Record Payment', aC, nC, isDebt: false);
    if (ok == true && aC.text.isNotEmpty) {
      await http.post(Uri.parse('$baseUrl/api/customers/${widget.customerId}/payments'), headers: await _hdrs(),
        body: jsonEncode({'amount': double.tryParse(aC.text) ?? 0, 'notes': nC.text.trim()}));
      await _load();
    }
  }

  Future<bool?> _txDialog(String title, TextEditingController amt, TextEditingController note, {required bool isDebt}) =>
    showDialog<bool>(context: context, builder: (_) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
      content: SizedBox(width: 340, child: Column(mainAxisSize: MainAxisSize.min, children: [
        _SettingsField(ctrl: amt, label: 'Amount (₱)'),
        const SizedBox(height: 10),
        _SettingsField(ctrl: note, label: isDebt ? 'Description (optional)' : 'Notes (optional)'),
      ])),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel', style: TextStyle(color: kTextMuted))),
        ElevatedButton(onPressed: () => Navigator.pop(context, true),
          style: ElevatedButton.styleFrom(
            backgroundColor: isDebt ? kRed : kGreen,
            foregroundColor: Colors.white, elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero)),
          child: Text(isDebt ? 'Add Debt' : 'Record')),
      ]));

  Future<void> _delDebt(int id) async {
    await http.delete(Uri.parse('$baseUrl/api/debts/$id'), headers: await _hdrs()); await _load(); }
  Future<void> _delPayment(int id) async {
    await http.delete(Uri.parse('$baseUrl/api/payments/$id'), headers: await _hdrs()); await _load(); }

  @override
  Widget build(BuildContext context) {
    final bal   = double.tryParse(_d?['balance']?.toString() ?? '0') ?? 0.0;
    final tD    = double.tryParse(_d?['total_debt']?.toString() ?? '0') ?? 0.0;
    final tP    = double.tryParse(_d?['total_paid']?.toString() ?? '0') ?? 0.0;
    final risk  = _d?['risk'] ?? 'NONE';
    final days  = _d?['days_outstanding'] ?? 0;
    final avg   = _d?['avg_days_to_repayment'];
    final late  = _d?['late_payments_count'] ?? 0;
    return Scaffold(backgroundColor: kBg,
      appBar: AppBar(backgroundColor: kNavy, foregroundColor: Colors.white, elevation: 0,
        title: Text(widget.customerName, style: GoogleFonts.fraunces(fontWeight: FontWeight.w400, fontSize: 20)),
        bottom: TabBar(controller: _tabs,
          labelColor: Colors.white, unselectedLabelColor: Colors.white54,
          indicatorColor: kAmberLight, indicatorWeight: 2,
          labelStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, letterSpacing: 0.8),
          tabs: const [Tab(text: 'Debts'), Tab(text: 'Payments'), Tab(text: 'History')])),
      body: _loading ? const Center(child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2))
        : Column(children: [
            // Summary banner
            Container(color: kNavy, padding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
              child: Column(children: [
                Row(children: [
                  _DS('Total Debt',  _peso(tD),  kAmberLight),
                  _DS('Total Paid',  _peso(tP),  const Color(0xFFA8D4C8)),
                  _DS('Balance',     _peso(bal),  bal > 0 ? const Color(0xFFE8A0A0) : const Color(0xFFA8D4C8)),
                  if (risk != 'NONE') ...[const SizedBox(width: 16),
                    Column(children: [_riskBadge(risk), const SizedBox(height: 4),
                      Text('$days days', style: const TextStyle(color: Colors.white54, fontSize: 10))])],
                ]),
                if (avg != null) ...[const SizedBox(height: 12),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.zero),
                    child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                      _MC('Avg. Repayment', '$avg days'),
                      Container(width: 1, height: 28, color: Colors.white12),
                      _MC('Late Payments', '$late'),
                      Container(width: 1, height: 28, color: Colors.white12),
                      _MC('Balance Age', '$days days'),
                    ]))],
              ])),
            // Action buttons
            Container(color: kCard, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(children: [
                Expanded(child: ElevatedButton.icon(onPressed: _addDebt,
                  icon: const Icon(Icons.add_rounded, size: 15), label: const Text('Add Debt'),
                  style: ElevatedButton.styleFrom(backgroundColor: kRed,
                    foregroundColor: Colors.white, elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                    textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)))),
                const SizedBox(width: 12),
                Expanded(child: ElevatedButton.icon(onPressed: _addPayment,
                  icon: const Icon(Icons.payments_outlined, size: 15), label: const Text('Record Payment'),
                  style: ElevatedButton.styleFrom(backgroundColor: kGreen,
                    foregroundColor: Colors.white, elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                    textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)))),
              ])),
            Expanded(child: TabBarView(controller: _tabs, children: [
              _TxList(items: (_d?['debts'] as List?) ?? [], emptyMsg: 'No debt records yet.',
                isDebt: true, onDelete: _isOwner ? _delDebt : null),
              _TxList(items: (_d?['payments'] as List?) ?? [], emptyMsg: 'No payments yet.',
                isDebt: false, onDelete: _isOwner ? _delPayment : null),
              _HistoryList(items: (_d?['history'] as List?) ?? []),
            ])),
          ]));
  }
}

class _DS extends StatelessWidget {
  final String l, v; final Color c;
  const _DS(this.l, this.v, this.c);
  @override Widget build(BuildContext context) => Expanded(child: Column(children: [
    Text(v, style: GoogleFonts.fraunces(color: c, fontWeight: FontWeight.w400, fontSize: 22, letterSpacing: -0.4)),
    Text(l.toUpperCase(), style: kMono(size: 9, color: const Color(0x88FFFFFF), tracking: 1.2)),
  ]));
}
class _MC extends StatelessWidget {
  final String l, v; const _MC(this.l, this.v);
  @override Widget build(BuildContext context) => Column(children: [
    Text(v, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
    Text(l, style: const TextStyle(color: Colors.white54, fontSize: 10)),
  ]);
}

// ─── Transaction list ─────────────────────────────────────────────────────────
class _TxList extends StatelessWidget {
  final List items; final String emptyMsg; final bool isDebt;
  final void Function(int)? onDelete;
  const _TxList({required this.items, required this.emptyMsg,
    required this.isDebt, this.onDelete});
  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return Center(child: _EmptyState(
      isDebt ? Icons.receipt_long_outlined : Icons.payments_outlined, emptyMsg, ''));
    return ListView.builder(
      padding: const EdgeInsets.all(14), itemCount: items.length,
      itemBuilder: (_, i) {
        final item = items[i];
        final note = item['description'] ?? item['notes'] ?? '';
        return Container(
          margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
            border: Border.all(color: kBorder)),
          child: Row(children: [
            Container(padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: isDebt ? kRedLight : kGreenLight,
                borderRadius: BorderRadius.zero),
              child: Icon(isDebt ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                color: isDebt ? kRed : kGreen, size: 14)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_peso(item['amount']), style: TextStyle(fontWeight: FontWeight.w700,
                color: isDebt ? kRed : kGreen, fontSize: 15)),
              if (note.toString().isNotEmpty) Text(note.toString(),
                style: const TextStyle(fontSize: 12, color: kTextMuted)),
              Text(_date(item['created_at']),
                style: const TextStyle(fontSize: 11, color: kTextLight)),
            ])),
            if (onDelete != null) _IconBtn(Icons.delete_outline_rounded, kRed, () => onDelete!(item['id'])),
          ]));
      });
  }
}

// ─── History list (FR-10) ─────────────────────────────────────────────────────
class _HistoryList extends StatelessWidget {
  final List items; const _HistoryList({required this.items});
  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const Center(child: _EmptyState(
      Icons.history_rounded, 'No transaction history', ''));
    return ListView.builder(
      padding: const EdgeInsets.all(14), itemCount: items.length,
      itemBuilder: (_, i) {
        final item = items[i];
        final isDebt = item['type'] == 'debt';
        final note = item['note'] ?? '';
        return Container(
          margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.zero,
            border: Border.all(color: kBorder)),
          child: Row(children: [
            Container(padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: isDebt ? kRedLight : kGreenLight,
                borderRadius: BorderRadius.zero),
              child: Icon(isDebt ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                color: isDebt ? kRed : kGreen, size: 14)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isDebt ? kRedLight : kGreenLight,
                    borderRadius: BorderRadius.zero),
                  child: Text(isDebt ? 'DEBT' : 'PAYMENT',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800,
                      color: isDebt ? kRed : kGreen, letterSpacing: 0.5))),
                const SizedBox(width: 8),
                Text(_peso(item['amount']), style: TextStyle(fontWeight: FontWeight.w700,
                  color: isDebt ? kRed : kGreen, fontSize: 14)),
              ]),
              if (note.toString().isNotEmpty) Text(note.toString(),
                style: const TextStyle(fontSize: 12, color: kTextMuted)),
              Text(_date(item['created_at']),
                style: const TextStyle(fontSize: 11, color: kTextLight)),
            ])),
          ]));
      });
  }
}
