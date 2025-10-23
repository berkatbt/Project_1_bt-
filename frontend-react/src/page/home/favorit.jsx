import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../../firebase/firebase";
import LoadingSpinner from "../../hooks/LoadingSpinner";
import { FaFacebook, FaInstagram, FaGithub, FaHeart, FaTrash, FaSearch, FaBookOpen } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Modal untuk detail buku
function BukuModal({ buku, onClose }) {
    if (!buku) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"
                >✖</button>
                <img
                    src={buku.cover || "/placeholder-book.jpg"}
                    alt={buku.judul}
                    className="w-full h-64 object-cover rounded-xl mb-4 shadow-lg"
                />
                <h2 className="text-2xl font-bold mb-2 text-blue-600">{buku.judul}</h2>
                <p className="text-gray-600 mb-1">Penulis: {buku.penulis}</p>
                <p className="text-gray-500 text-sm mb-3">Kategori: {buku.kategori}</p>
                <p className="text-gray-700">{buku.deskripsi || "Tidak ada deskripsi tersedia."}</p>
            </motion.div>
        </div>
    );
}

export default function FavoritPage() {
    const [favorit, setFavorit] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [selectedBuku, setSelectedBuku] = useState(null);
    const [activeKategori, setActiveKategori] = useState("Semua");
    

    //ambil data  buku
    const fetchFavorit = async (userUid) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/favorite/${userUid}`);
            setFavorit(res.data);
        } catch (err) {
            console.error("Gagal mengambil data favorit", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) fetchFavorit(user.uid);
            else setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    

    //hapus favorit
    const hapusFavorit = async (bukuId) => {
        if (!auth.currentUser) return alert("Kamu harus login dulu!");
        try {
            const res = await axios.delete("http://127.0.0.1:8000/api/favorite/remove", {
                data: { user_uid: auth.currentUser.uid, buku_id: bukuId },
            });
            alert(res.data.message);
            setFavorit(prev => prev.filter(f => f.buku.id !== bukuId));
            setCount(prev => prev - 1);
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus favorit");
        }
    };

    useEffect(() => {
        const fetchCount = async () => {
            if (!auth.currentUser) return;
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/favorite/count/${auth.currentUser.uid}`);
                setCount(res.data.total_favorit);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCount();
    }, []);

    const kategoriList = ["Semua", ...new Set(favorit.map(f => f.buku.kategori))];
    const filteredFavorit = activeKategori === "Semua" ? favorit : favorit.filter(f => f.buku.kategori === activeKategori);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <LoadingSpinner size={80} stroke={7} color="#60A5FA" text="Memuat data..." />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-indigo-200 to-white text-[#111] py-20 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto px-4 text-center"
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Buku Favoritmu</h1>
                    <p className="text-[#111] text-xl mb-8">Temukan koleksi buku pilihan yang paling kamu sukai!</p>
                    <div className="flex justify-center gap-6">
                        <span className="bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full text-lg font-medium shadow-lg">Total Favorit: <span className="text-blue-400">{count}</span></span>
                    </div>
                </motion.div>
                {/* Floating circles */}
                <div className="absolute -top-16 -left-16 w-40 h-40 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-20 -right-16 w-60 h-60 bg-indigo-500/20 rounded-full animate-pulse"></div>
            </section>

            {/* Tab Kategori */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {kategoriList.map(k => (
                        <motion.button
                            key={k}
                            onClick={() => setActiveKategori(k)}
                            whileHover={{ scale: 1.1 }}
                            className={`px-5 py-2 rounded-full font-semibold transition-colors duration-300 ${activeKategori === k ? "bg-white text-[#111] shadow-lg" : "bg-white text-[#111]"}`}
                        >
                            {k}
                        </motion.button>
                    ))}
                </div>

                {/* Card Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredFavorit.map((fav, i) => (
                        <motion.div
                            key={fav.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden cursor-pointer relative group hover:scale-105 transition-transform duration-500"
                            onClick={() => setSelectedBuku(fav.buku)}
                        >
                            <div className="relative h-72">
                                <img
                                    src={fav.buku.cover || "/placeholder-book.jpg"}
                                    alt={fav.buku.judul}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-3xl"
                                />
                                <span className="absolute top-4 left-4 bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">{fav.buku.kategori}</span>
                            </div>
                            <div className="p-6 flex flex-col justify-between h-48">
                                <h3 className="text-2xl font-bold text-[#111] mb-2 line-clamp-2">{fav.buku.judul}</h3>
                                <p className="text-gray-700 mb-4">penulis: {fav.buku.penulis}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">{new Date(fav.created_at).toLocaleDateString('id-ID')}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); hapusFavorit(fav.buku.id); }}
                                        className="text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors duration-300"
                                    >
                                        <FaTrash />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal Detail Buku */}
            <AnimatePresence>
                {selectedBuku && <BukuModal buku={selectedBuku} onClose={() => setSelectedBuku(null)} />}
            </AnimatePresence>

            {/* CTA */}
            <div className="max-w-4xl mx-auto text-center py-16">
                <motion.a
                    href="/semua"
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold rounded-3xl shadow-2xl hover:shadow-xl transition-all duration-300"
                >
                    <FaSearch /> Jelajahi Lebih Banyak
                </motion.a>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

function Footer() {
    return (
         <footer className="footer">
               <div className="footer-container">
                 <div className="flex items-center justify-center p-2">
                   <img
                     src="/b.png"
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
    );
}
