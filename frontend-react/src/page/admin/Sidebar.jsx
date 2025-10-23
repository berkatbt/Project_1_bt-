import React, { useEffect, useState } from "react";
import { auth, db, } from "../../firebase/firebase";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import axios from "axios";
import { motion } from "framer-motion";

//import "../../css/sidebar.css";

function LayoutDash() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    penulis: "",
    penerbit: "",
    kategori: "",
    deskripsi: "",
    tahun_terbit: "",
    tebal_buku: "",
    cover: "",
  });

  // Fungsi tambah buku
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/buku", formData);
      alert("Buku berhasil ditambahkan!");
      setFormData({
        judul: "",
        penulis: "",
        penerbit: "",
        kategori: "",
        deskripsi: "",
        tahun_terbit: "",
        tebal_buku: "",
        cover: "",
      });
    } catch (error) {
      console.error("Gagal menambah buku:", error);
      alert("Gagal menambah buku!");
    }
  };


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) localStorage.setItem("user", JSON.stringify(currentUser));
      else localStorage.removeItem("user");
    });
    return () => unsub();
  }, []);

  // 🔹 Logout normal
  const handleLogout = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "Users", user.uid), { isOnline: false });
      await signOut(auth);
      localStorage.removeItem("user");
      navigate("/loginAdmin");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  // 🔹 Status offline otomatis saat keluar/tab ditutup
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!user) return;
      try {
        navigator.sendBeacon(
          `https://firestore.googleapis.com/v1/projects/${db.app.options.projectId}/databases/(default)/documents/Users/${user.uid}?updateMask.fieldPaths=isOnline`,
          JSON.stringify({
            fields: { isOnline: { booleanValue: false } },
          })
        );
      } catch (err) {
        console.warn("Gagal update status offline:", err);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  return (
    <div className="fixed flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-400 to-indigo-900 text-white shadow-xl flex flex-col">
        {/* Header Sidebar */}
        <div className="p-6 border-b border-indigo-600">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user?.photoURL || "/Users-person.png"}
                alt="Foto Profil"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {user?.displayName || "Admin"}
              </h3>
              <p className="text-xs text-blue-200 truncate">
                {user?.email || "belum login"}
              </p>
            </div>
          </div>
        </div>

        {/* Judul Dashboard */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-bold text-white tracking-wide">Dashboard</h2>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-1 group"
              >
                <img
                  src="/svg/stats.svg"
                  alt="Dashboard Icon"
                  className="w-5 h-5 mr-3 filter brightness-0 invert"
                />
                <span>Dashboard</span>
              </Link>
            </li> 

             <li>
              <Link
                to=""
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-1 group"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <img
                  src="/svg/add.svg"
                  alt="Dashboard Icon"
                  className="w-5 h-5 mr-3 filter brightness-0 invert"
                />
                <span>Tambah</span>
              </Link>
            </li>
          </ul>

          <div className="px-5 py-4 bg-white rounded-xl shadow-lg mx-3 mb-4 text-gray-700 animate-slide-down overflow-y-auto max-h-[70vh]">
            <h3 className="font-bold text-blue-600 text-center mb-3">Tambah Buku</h3>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                name="judul"
                placeholder="Judul Buku"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                name="penulis"
                placeholder="Penulis"
                value={formData.penulis}
                onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                name="penerbit"
                placeholder="Penerbit"
                value={formData.penerbit}
                onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <select
                name="kategori"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Pilih Kategori</option>
                <option value="Fiksi">Fiksi</option>
                <option value="Non-Fiksi">Non-Fiksi</option>
                <option value="Pelajaran">Pelajaran</option>
                <option value="Komik">Komik</option>
                <option value="Sejarah">Sejarah</option>
              </select>
              <textarea
                name="deskripsi"
                placeholder="Deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
              ></textarea>
              <input
                type="number"
                name="tahun_terbit"
                placeholder="Tahun Terbit"
                value={formData.tahun_terbit}
                onChange={(e) => setFormData({ ...formData, tahun_terbit: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="tebal_buku"
                placeholder="Tebal Buku (halaman)"
                value={formData.tebal_buku}
                onChange={(e) => setFormData({ ...formData, tebal_buku: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="cover"
                placeholder="URL Cover Buku"
                value={formData.cover}
                onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold transition"
              >
                Simpan Buku
              </button>
            </form>
          </div>

        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-indigo-600/50 mb-[100px] relative">
          <motion.button
            onClick={handleLogout}
            whileHover={{
              scale: 1.05,
              y: -2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
              }
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-full relative flex items-center justify-center px-6 py-4 text-sm font-semibold text-white bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl backdrop-blur-xl border border-red-400/30 hover:border-red-300/50 shadow-lg hover:shadow-red-500/20 overflow-hidden group"
          >
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-100"
              initial={false}
              transition={{ duration: 0.4 }}
            />

            {/* Floating Particles Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              initial={false}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-70"
                  initial={{
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 100 - 50,
                    scale: 0
                  }}
                  whileHover={{
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0],
                    transition: {
                      duration: 1.5,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }
                  }}
                />
              ))}
            </motion.div>

            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-red-400 blur-xl opacity-0 group-hover:opacity-30"
              initial={false}
              transition={{ duration: 0.5 }}
            />

            {/* Animated Border */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-red-500 via-pink-500 to-red-500 bg-[length:200%_100%]"
              initial={{ backgroundPosition: "100% 0%" }}
              whileHover={{
                backgroundPosition: "0% 0%",
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center">
              {/* Animated Icon */}
              <motion.div
                className="relative"
                whileHover={{
                  rotate: [0, -10, 10, -5, 0],
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut"
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-3 filter drop-shadow-sm"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>

                {/* Icon Glow */}
                <motion.div
                  className="absolute inset-0 bg-red-400 blur-md opacity-0 group-hover:opacity-60"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              {/* Text with Slide Effect */}
              <motion.span
                className="tracking-wide drop-shadow-sm"
                initial={false}
                whileHover={{
                  x: [0, 2, 0],
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut"
                  }
                }}
              >
                Keluar
              </motion.span>

              {/* Sparkle Effect */}
              <motion.div
                className="ml-2 opacity-0 group-hover:opacity-100"
                initial={false}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </motion.div>
            </div>

            {/* Ripple Effect on Click */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-white opacity-0"
              whileTap={{
                opacity: 0.3,
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
            />
          </motion.button>

          {/* Floating Tooltip */}
          <motion.div
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 pointer-events-none"
            initial={false}
            whileHover={{ opacity: 1, y: -2 }}
            transition={{ duration: 0.3 }}
          >
            Logout dari sistem
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>


    </div>
  );
}

export default LayoutDash;
