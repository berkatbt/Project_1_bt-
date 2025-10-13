import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../firebase/firebase.js";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, User, Shield } from "lucide-react";
import "../../css/loginAdmin.css";

function LoginAdmin() {
    const [error, setError] = useState("");
    const navigate = useNavigate();
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

            navigate("/dashboard");
        } catch (err) {
            setError("Login Google gagal!");
            console.error(err);
        }
    };
    return (
        <div className="login-container-admin">
            {/* Left Side - Hero Section */}
            <div className="animated-bg-admin">
                <div className="grid-lines"></div>
                <div className="bg-circle"></div>
                <div className="bg-circle"></div>
                <div className="bg-circle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>
            <div className="login-left-admin">
                <div className="hero-content-admin">
                    
                    <div className="logo-admin">
                        <BookOpen className="logo-icon-admin" />
                        <span className="logo-text-admin">inBook</span>
                    </div>
                    <div className="hero-main-admin">
                        <h1>Login sebagai Admin</h1>
                    </div>
                </div>
                <div className="login-card-admin">
                    <div className="card-header-admin">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account</p>
                    </div>
                    <div className="social-buttons-admin">
                        <button onClick={handleGoogleLogin} className="social-btn-admin google-btn-admin">
                            <img
                                src="https://www.svgrepo.com/show/355037/google.svg"
                                alt="Google"
                                className="social-icon-admin"
                            />
                            <span className="social-text-admin">Google</span>
                        </button>
                                  <div className="register-section">
                                    <span>log in as </span>
                                    <Link to="/login" className="register-link" style={{ color: "black" }}
>
                                      users
                                      <ArrowRight className="link-icon" size={16} />
                                    </Link>
                                  </div>
                    </div>
                    <div className="security-note-admin">
                        <div className="security-icon-admin">🔒</div>
                        <span>Your data is securely encrypted</span>
                    </div>
                </div>
                <div className="background-shapes">
                    <div className="shape shape-1-admin"></div>
                    <div className="shape shape-2-admin"></div>
                    <div className="shape shape-3-admin"></div>
                </div>
            </div>
        </div>
    );
}

export default LoginAdmin;
