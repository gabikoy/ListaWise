import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

const kPrimary      = Color(0xFF6B74D6);
const kPrimaryDark  = Color(0xFF4B52B0);
const kPrimaryLight = Color(0xFFE8EAFA);
const kNavy         = Color(0xFF1E2254);
const kAmber        = Color(0xFFC9963A);
const kAmberLight   = Color(0xFFE8C97A);
const kRed          = Color(0xFFC45C5C);
const kRedLight     = Color(0xFFF8EEEE);
const kGreen        = Color(0xFF3D8B7A);
const kGreenLight   = Color(0xFFEEF6F3);
const kOrange       = Color(0xFFC9963A);
const kOrangeLight  = Color(0xFFF7F0DE);
const kBg           = Color(0xFFF4F5F7);
const kSidebar      = Color(0xFF1E2254);
const kSidebarHover = Color(0xFF2A2F68);
const kCard         = Colors.white;
const kBorder       = Color(0x1A1E223C);
const kTextDark     = Color(0xFF1E2254);
const kTextMid      = Color(0xFF3A3F6A);
const kTextMuted    = Color(0x7A1E2254);
const kTextLight    = Color(0xFF9AA0B8);
const kInactivityTimeout = Duration(minutes: 15);

TextStyle kDisplay({
  double size = 28,
  FontWeight weight = FontWeight.w300,
  Color color = kNavy,
  FontStyle style = FontStyle.normal,
  double tracking = -0.6,
}) =>
    GoogleFonts.fraunces(
      fontSize: size,
      fontWeight: weight,
      color: color,
      fontStyle: style,
      letterSpacing: tracking,
      height: 1.05,
    );

TextStyle kMono({
  double size = 10,
  Color color = kPrimary,
  FontWeight weight = FontWeight.w500,
  double tracking = 1.8,
}) =>
    GoogleFonts.jetBrainsMono(
      fontSize: size,
      fontWeight: weight,
      color: color,
      letterSpacing: tracking,
    );

TextStyle kBody({
  double size = 13,
  FontWeight weight = FontWeight.w400,
  Color color = kTextMid,
}) =>
    GoogleFonts.inter(fontSize: size, fontWeight: weight, color: color);
