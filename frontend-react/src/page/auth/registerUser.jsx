import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } from "lucide-react";
import "../../css/register.css";

function RegisterUsers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "pengguna", res.user.uid), {
        nama: name,
        email,
        status: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        last_login: null,
      });
      navigate("/login");
    } catch (err) {
      setError("Gagal membuat akun: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Left Side - Hero Section */}
      <div className="register-left">
        <div className="hero-content">
          <div className="logo">
            <BookOpen className="logo-icon" />
            <span className="logo-text">NexusRead</span>
          </div>
          
          <div className="hero-main">
            <h1>Join Our Reading Community</h1>
            <p>Discover thousands of books and connect with fellow readers. Start your literary journey today.</p>
          </div>

          {/* <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">📚</div>
              <div className="feature-text">
                <h4>10K+ Books</h4>
                <p>Extensive collection</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <h4>5K+ Readers</h4>
                <p>Active community</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">⭐</div>
              <div className="feature-text">
                <h4>Premium Access</h4>
                <p>Unlimited reading</p>
              </div>
            </div>
          </div> */}

          {/* <div className="testimonial">
            <div className="quote">"Best platform for book lovers. Amazing community!"</div>
            <div className="author">- Sarah, Book Enthusiast</div>
          </div> */}
        </div>
        
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="register-right">
        <div className="register-card">
          <div className="card-header">
            <h2>Create Your Account</h2>
            <p>Join thousands of readers today</p>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="register-form">
            <div className="input-group">
              <div className="input-container">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>

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
                  placeholder="Password (min 6 characters)"
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

            <button 
              type="submit" 
              disabled={loading}
              className={`register-btn ${loading ? 'loading' : ''}`}
            >
              <span className="btn-text">
                {loading ? "Creating Account..." : "Create Account"}
              </span>
              {!loading && <ArrowRight className="btn-icon" size={20} />}
              {loading && <div className="spinner"></div>}
            </button>
          </form>

          <div className="divider">
            <span>Already have an account?</span>
          </div>

          <div className="login-section">
            <Link to="/login" className="login-link">
              <span>Sign in to your account</span>
              <ArrowRight className="link-icon" size={16} />
            </Link>
          </div>

          <div className="terms">
            By creating an account, you agree to our{" "}
            <a href="#" className="terms-link">Terms of Service</a> and{" "}
            <a href="#" className="terms-link">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterUsers;