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

export default function Home() {
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

  //video sorotan
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

      <section>
        <div className='canadian-section'>
          <div
            className='carousel-container'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className='carousel-track'
              style={{
                transform: `translateX(-${currentIndex * itemWidth}px)`,
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              {video.map((video, index) => (
                <div key={index} className="carousel-item">
                  <video
                    src={video}
                    loop
                    autoPlay
                    muted
                    playsInline

                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}  // ✅ panggil fungsinya
                    alt={`Student ${index + 1}`}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="overlay-text-container">
              <div className='overlay-text'>
                <h1>
                  <span className='line1'>CATALOG</span>
                  <br />
                  <span className='line2'>BOOKS</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-sorotan-full-animasi-home">
        {/* <ScrollVelocity
          texts={['Selamat batang di katalog buku', 'Banyak yang kamu suka']}
          velocity={velocity}
          className="custom-scroll-text"
        /> */}
      </div>

      {/* Hero Section */}
      <section className="hero">
        <h1>
          <Typewriter
            words={["Temukan buku favorit anda"]}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <p>
          Jelajahi ribuan buku dari berbagai genre. Dari bestseller hingga karya
          tersembunyi, temukan cerita yang menginspirasi.
        </p>
        <input
          type="text"
          placeholder="Cari judul buku"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cari buku"
        />
      </section>

      {/* Buku Section */}
      <section className="list-buku">
        <div className="header">
          <h2>Semua Buku</h2>
        </div>
        <div className="grid-buku">
          {filteredBuku.length > 0 ? (
            filteredBuku.map((item, index) => (
              <div key={item.id} className="card-buku" style={{
                animationDelay: `${index * 0.25}s`,
              }}>
                <span className="kategori">{item.kategori}</span>
                <div className="cover">
                  <img
                    src={item.cover || "/placeholder-book.jpg"}
                    alt={`Sampul buku: ${item.judul}`}
                    onError={(e) => {
                      e.target.src = "/placeholder-book.jpg";
                    }}
                  />
                </div>
                <div className="info">
                  <h3>{item.judul}</h3>
                  <p>oleh {item.penulis}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-books">Tidak ada buku ditemukan.</p>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="flex items-center justify-center p-2">
            <img
              src="b.png"
              alt="logo"
              className="w-32 md:w-40 lg:w-48 object-contain cursor-pointer transition-transform duration-300"
            />
          </div>

          {/* Bagian 1 - Tentang */}
          <div className="footer-section">
            <h2 className="footer-title">📚 Jejak Buku</h2>
            <p className="footer-text">
              Temukan ribuan koleksi buku menarik mulai dari fiksi, non-fiksi, hingga buku pelajaran.
              Jejak Buku adalah tempat terbaik untuk para pembaca sejati.
            </p>
          </div>

          {/* Bagian 2 - Navigasi */}
          <div className="footer-section">
            <h3 className="footer-subtitle">Navigasi</h3>
            <ul className="footer-links">
              <li><a href="/semua">semua</a></li>
              <li><a href="/favorit">Favorit</a></li>
              <li><a href="#">Tentang</a></li>
            </ul>
          </div>

          {/* Bagian 3 - Sosial Media */}
          <div className="footer-section">
            <h3 className="footer-subtitle">Ikuti Kami</h3>
            <div className="footer-socials">
              <a href="https://www.facebook.com/profile.php?id=100081955621560" className="social-icon-footer facebook"><FaFacebook /></a>
              <a href="https://www.instagram.com/berkat_bt/" className="social-icon-footer instagram"><FaInstagram /></a>
              <a href="https://github.com/berkatbt" className="social-icon-footer github"><FaGithub /></a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} katalog buku by Berkat_bt!. Semua hak dilindungi.
        </div>
      </footer>

    </div>
  );
}