import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:mobile/page/home_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MaterialApp(home: LoginGoogle()));
}

class LoginGoogle extends StatefulWidget {
  @override
  _LoginGoogleState createState() => _LoginGoogleState();
}

class _LoginGoogleState extends State<LoginGoogle> {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: <String>['email']);
  User? _currentUser;

  @override
  void initState() {
    super.initState();
    // Cek apakah user sudah login
    _checkCurrentUser();
  }

  void _checkCurrentUser() {
    _currentUser = _auth.currentUser;
    if (_currentUser != null) {
      setState(() {});
    }
  }

  Future<User?> _signIn() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
        accessToken: googleAuth.accessToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final user = userCredential.user;

      print("Nama user: ${user?.displayName}");

      setState(() {
        _currentUser = user;
      });

      return user;
    } catch (e) {
      print("Error sign in: $e");
      return null;
    }
  }

  Future<void> _signOut() async {
    try {
      await _googleSignIn.signOut();
      await _auth.signOut();
      setState(() {
        _currentUser = null;
      });
    } catch (e) {
      print("Error signing out: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    // Jika user sudah login, tampilkan halaman home
    if (_currentUser != null) {
      return HomePage(user: _currentUser!, onSignOut: _signOut);
    }

    // Jika belum login, tampilkan halaman login
    return Scaffold(
      appBar: AppBar(title: Text("Login Admin"), backgroundColor: Colors.black),
      body: Container(
        padding: EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                padding: EdgeInsets.symmetric(vertical: 15.0, horizontal: 30.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
              onPressed: _signIn,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.account_circle, color: Colors.white),
                  SizedBox(width: 10),
                  Text(
                    "Login dengan Google",
                    style: TextStyle(fontSize: 18.0, color: Colors.white),
                  ),
                ],
              ),
            ),
            SizedBox(height: 20),
            Text(
              "Silakan login untuk melanjutkan",
              style: TextStyle(fontSize: 16.0, color: Colors.grey),
            ),
            ElevatedButton(
              onPressed: () {
                // Navigasi ke halaman admin
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const HomePageAdmin()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 16,
                ),
              ),
              child: const Text("Buka Halaman Admin"),
            ),
          ],
        ),
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  final User user;
  final VoidCallback onSignOut;

  const HomePage({Key? key, required this.user, required this.onSignOut})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Home - Profile"),
        backgroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: onSignOut,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Foto profil
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.blue, width: 3),
              ),
              child: ClipOval(
                child: user.photoURL != null
                    ? Image.network(
                        user.photoURL!,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Center(child: CircularProgressIndicator());
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return Icon(
                            Icons.account_circle,
                            size: 100,
                            color: Colors.grey,
                          );
                        },
                      )
                    : Icon(Icons.account_circle, size: 100, color: Colors.grey),
              ),
            ),
            SizedBox(height: 20),

            // Nama pengguna
            Text(
              user.displayName ?? 'Nama tidak tersedia',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 10),

            // Email
            Text(
              user.email ?? 'Email tidak tersedia',
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 30),

            // Card informasi akun
            Card(
              elevation: 4,
              margin: EdgeInsets.symmetric(horizontal: 10),
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    _buildInfoRow("UID", user.uid),
                    _buildInfoRow(
                      "Email Verified",
                      user.emailVerified ? "Ya" : "Tidak",
                    ),
                    _buildInfoRow(
                      "Phone Number",
                      user.phoneNumber ?? "Tidak tersedia",
                    ),
                    _buildInfoRow(
                      "Provider",
                      user.providerData.isNotEmpty
                          ? user.providerData.first.providerId
                          : "Tidak tersedia",
                    ),
                    _buildInfoRow(
                      "Last Sign In",
                      user.metadata.lastSignInTime != null
                          ? _formatDate(user.metadata.lastSignInTime!)
                          : "Tidak tersedia",
                    ),
                    _buildInfoRow(
                      "Account Created",
                      user.metadata.creationTime != null
                          ? _formatDate(user.metadata.creationTime!)
                          : "Tidak tersedia",
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 30),

            // Tombol logout
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: EdgeInsets.symmetric(vertical: 15.0, horizontal: 30.0),
              ),
              onPressed: onSignOut,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.logout, color: Colors.white),
                  SizedBox(width: 10),
                  Text(
                    "Logout",
                    style: TextStyle(fontSize: 18.0, color: Colors.white),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              "$label:",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(value, style: TextStyle(color: Colors.grey[800])),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return "${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}";
  }
}
