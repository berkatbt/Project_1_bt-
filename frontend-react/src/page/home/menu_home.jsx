// src/page/home/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Typewriter } from "react-simple-typewriter";
import "../../css/home.css";
import { auth, db } from "../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
// import ScrollVelocity from "./ScrollVelocity";
// import tambahFavorit from "../../hooks/tambahFavorit";
import { FaFacebook, FaInstagram, FaGithub } from "react-icons/fa";
import LoadingSpinner from "../../hooks/LoadingSpinner";
import { motion } from "framer-motion";

// 🔥 Import untuk Google Login
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

export default function Menu_Home() {
    const [buku, setBuku] = useState([]);
    const [search, setSearch] = useState("");
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const velocity = 200;

    const navigate = useNavigate();
    const popupRef = useRef(null);

    // Tutup popup saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        };
        if (showPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPopup]);

    // Pantau status autentikasi
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);


    // Ambil data buku
    useEffect(() => {
        axios
            .get("http://localhost:8000/api/buku")
            .then((res) => setBuku(res.data))
            .catch((err) => console.error("Gagal mengambil data buku:", err));
    }, []);

    // 🔥 Fungsi Login dengan Google
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: "select_account", // agar selalu pilih akun
        });
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Foto profil dari Google:", user.photoURL); // ✅ Ini akan berisi URL foto asli
            // Tidak perlu redirect manual — onAuthStateChanged akan tangkap otomatis
        } catch (error) {
            console.error("Error saat login dengan Google:", error);
            alert("Gagal login dengan Google. Silakan coba lagi.");
        }
    };

    const handleLogout = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "Users", user.uid), { isOnline: false });
            await signOut(auth);
            localStorage.removeItem("user");
            navigate("/login");
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    const filteredBuku = buku.filter(
        (item) =>
            item.judul.toLowerCase().includes(search.toLowerCase()) ||
            item.penulis.toLowerCase().includes(search.toLowerCase()) ||
            item.kategori.toLowerCase().includes(search.toLowerCase())
    );

    //ambil jumlah data pengunjung
    useEffect(() => {
        const saveVisitor = async () => {
            try {
                const tanggal = new Date().toISOString().split("T")[0]; //yy-mm-dd
                await addDoc(collection(db, "pengunjung"), { tanggal });
            } catch (err) {
                console.error("Gagal menyipan data pengunjung", err);
            }
        };

        saveVisitor();
    }, []);

    //Header Section
    const video = [
        "/video/Zenitsu _Agatsuma_4k.mp4",
        "/video/snaptik_7457712899159559429_hd.mp4",
        "/video/snaptik_7225657653291273474_hd.mp4",
        "/video/snaptik_7554695777780600071_hd.mp4",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateWidth = () => {
            const carousel = document.querySelector('.carousel-item');
            if (carousel) setItemWidth(carousel.clientWidth);
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // useEffect(() => {
    //   if (!isHovering) {
    //     const interval = setInterval(() => {
    //       setCurrentIndex((prev) => (prev + 1) % images.length);
    //     }, 3000);
    //     return () => clearInterval(interval);
    //   }
    // }, [isHovering, images.length]);

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);



    return (
        <div className="home">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">inBook</div>
                <div className="menu">
                    <Link to="/">home</Link>
                    <Link to="/favorit">favorit</Link>
                    <Link to="/semua">Semua Buku</Link>
                    {user ? (
                        <div className="profile-section" ref={popupRef}>
                            <img
                                src={user.photoURL || "Users-person.png"}
                                alt="Profil pengguna"
                                className="profile-pic"
                                onClick={() => setShowPopup(!showPopup)}
                            />
                            {showPopup && (
                                // <div className="profile-popup">
                                //   <img
                                //     src={user.photoURL || "Users-person.png"}
                                //     alt=""
                                //   />
                                //   <h3>{user.displayName || "Pengguna"}</h3>
                                //   <p>{user.email}</p>
                                //   <button onClick={handleLogout}>Keluar</button>
                                // </div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className=" absolute right-5 top-16 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-6 w-64 flex flex-col items-center text-center border border-gray-100"
                                >
                                    <img
                                        src={user.photoURL || "Users-person.png"}
                                        alt="Foto Profil"
                                        className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-blue-500"
                                    />
                                    <h3 className="mt-3 text-lg font-semibold text-gray-800">
                                        {user.displayName || "Pengguna"}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate w-full">{user.email}</p>

                                    <button
                                        onClick={handleLogout}
                                        className="mt-5 w-full py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-md"
                                    >
                                        Keluar
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        // 🔥 Ganti tautan "Login" biasa dengan tombol Google Login
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-2 px-5 rounded-xl shadow-lg hover:scale-105 transform transition duration-300"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google logo"
                                className="w-5 h-5 bg-white rounded-full p-[2px]"
                            />
                            Login
                        </button>

                    )}
                </div>
            </nav>
        </div>
    );
}