import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../firebase/firebase.js";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, User, Shield } from "lucide-react";
import "../../css/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Login ke Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan/update data user ke Firestore
      await setDoc(
        doc(db, "Users", user.uid), // <- pakai UID agar tidak duplikat
        {
          email: user.email,
          displayName: user.displayName || "Tanpa Nama",
          isOnline: true,
          lastLogin: new Date().toISOString(),
        },
        { merge: true } // biar kalau sudah ada, hanya update
      );

      navigate("/"); // arahkan ke dashboard utama
    } catch (err) {
      setError("Email atau password salah!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const handleLoginADMIN = async (e) => {
  e.preventDefault();
  navigate("/loginAdmin");
};


  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, "Users", user.uid),
        {
          email: user.email,
          displayName: user.displayName || "Users",
          isOnline: true,
        },
        { merge: true }
      );

      navigate("/");
    } catch (err) {
      setError("Login Google gagal!");
      console.error(err);
    }
  };

  const handleAdminLogin = () => {
    navigate("/");
  };




  return (
    <div className="login-container">
      {/* Left Side - Hero Section */}
      <div className="login-left">
        <div className="hero-content">
          <div className="logo">
            <BookOpen className="logo-icon" />
            <span className="logo-text">NexusRead</span>
          </div>

          <div className="hero-main">
            <h1>Welcome Back, Reader!</h1>
            <p>Continue your literary journey. Access your personalized bookshelf and discover new stories.</p>
          </div>

        </div>

        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="login-right">
        <div className="login-card">
          <div className="card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <div className="input-container">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login-btn ${loading ? 'loading' : ''}`}
            >
              <span className="btn-text">
                {loading ? "Signing In..." : "Sign In"}
              </span>
              {!loading && <ArrowRight className="btn-icon" size={20} />}
              {loading && <div className="spinner"></div>}
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
            <button onClick={handleGoogleLogin} className="social-btn google-btn">
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="social-icon"
              />
              <span className="social-text">Google</span>
            </button>

            <button onClick={handleLoginADMIN} className="social-btn admin-btn">
              <Shield className="social-icon" size={20} />
              <span className="social-text">Admin</span>
            </button>
          </div>

          <div className="register-section">
            <span>Don't have an account? </span>
            <Link to="/register" className="register-link">
              Sign up now
              <ArrowRight className="link-icon" size={16} />
            </Link>
          </div>

          <div className="security-note">
            <div className="security-icon">🔒</div>
            <span>Your data is securely encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;