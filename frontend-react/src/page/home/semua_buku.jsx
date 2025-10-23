import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from "../../hooks/LoadingSpinner";

// css
import "../../css/semua.css"
import { FirebaseError } from "firebase/app";
import { FaFacebook, FaInstagram, FaGithub } from "react-icons/fa";

export default function SemuaBuku() {
  const [showModal, setShowModal] = useState(false);
  const [buku, setBuku] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuku, setSelectedBuku] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("judul");
  const [user, setUser] = useState(null);

  // ✅ Buat fungsi fetchBuku agar bisa dipanggil ulang setelah tambah buku
  const fetchBuku = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/buku");
      setBuku(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal mengambil data buku:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchBuku();
  }, []);

  // Filter dan sort buku
  const filteredBuku = buku
    .filter(item => {
      const matchesSearch = item.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.penulis?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.kategori === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "judul") return a.judul?.localeCompare(b.judul);
      if (sortBy === "tahun") return b.tahun_terbit - a.tahun_terbit;
      return 0;
    });

  const categories = ["all", ...new Set(buku.map(item => item.kategori).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size={80} stroke={7} color="#60A5FA" text="Memuat data..." />
      </div>
    );
  }


  // fungsi tambah favorit
  const tambahFavorit = async (bukuId) => {
    if (!user) {
      alert("Kamu harus login dulu!");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/favorite/add", {
        user_uid: user.uid, // ✅ sesuai field di Laravel controller
        buku_id: bukuId,    // ✅ sesuai validasi di Laravel
      });

      alert(res.data.message);
    } catch (err) {
      console.error("Gagal menambah ke favorit:", err);
      alert("Terjadi kesalahan saat menambah ke favorit!");
    }
  };


  return (
    <div className="semua-buku-page">
      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Cari judul atau penulis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls w-64 mx-auto mb-6 justify-end  mr-[20px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 text-gray-800 font-medium shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 cursor-pointer"
          >
            <option value="all" className="bg-white/90 text-gray-800">Semua Kategori</option>
            {categories.map(cat => (
              cat !== "all" && (
                <option key={cat} value={cat} className="bg-white/90 text-gray-800">{cat}</option>
              )
            ))}
          </select>
        </div>

      </div>


      {/* Books Grid */}
      <div className="books-container">
        {filteredBuku.length === 0 ? (
          <div className="empty-state">
            <h3>Tidak ada buku ditemukan</h3>
            <p>Coba ubah pencarian atau filter Anda</p>
          </div>
        ) : (
          <div className="books-grid">
            {filteredBuku.map((item, index) => (
              <div
                key={item.id}
                className="book-card"
                style={{
                  animationDelay: `${index * 0.25}s`,
                }}>
                <div className="book-cover-container">
                  <img
                    src={item.cover || "/placeholder-book.jpg"}
                    alt={item.judul}
                    className="book-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/200x280/1e293b/ffffff?text=No+Cover";
                    }}/>
                  <div className="book-overlay">
                    <span className="view-details"
                      onClick={() => setSelectedBuku(item)}
                    >Lihat Detail</span>
                  </div>
                  {item.kategori && (
                    <div className="book-category">{item.kategori}</div>
                  )}
                </div>
                <div className="book-info">
                  <h3 className="book-title">{item.judul}</h3>
                  <p className="book-author">oleh {item.penulis}</p>
                  <div className="book-meta">
                    {item.tahun_terbit && (
                      <span className="book-year">{item.tahun_terbit}</span>
                    )}
                    {item.penerbit && (
                      // <span className="book-publisher">{item.penerbit}</span>
                      <button onClick={() => tambahFavorit(item.id)} className="btn-ravorit-semua-buku">
                        ♡
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Buku */}
      {selectedBuku && (
        <div className="modal-overlay-semua" onClick={() => setSelectedBuku(null)}>
          <div className="modal-content-semua" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-semua"
              onClick={() => setSelectedBuku(null)}>✕</button>
            <div className="modal-body-semua">
              <div className="modal-cover-section-semua">
                <img
                  src={selectedBuku.cover || "/placeholder-book.jpg"}
                  alt={selectedBuku.judul}
                  className="modal-cover-semua"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x420/1e293b/ffffff?text=No+Cover";}}/>
              </div>
              <div className="modal-details-semua">
                <div className="modal-header-semua">
                  <h2 className="modal-title-semua">{selectedBuku.judul}</h2>
                  {selectedBuku.kategori && (
                    <div className="modal-category-semua">{selectedBuku.kategori}</div>
                  )}
                </div>
                <div className="detail-grid-semua">
                  <div className="detail-item-semua">
                    <span className="detail-label-semua">Penulis</span>
                    <span className="detail-value-semua">{selectedBuku.penulis}</span>
                  </div>
                  <div className="detail-item-semua">
                    <span className="detail-label-semua">Penerbit</span>
                    <span className="detail-value-semua">{selectedBuku.penerbit}</span>
                  </div>
                  <div className="detail-item-semua">
                    <span className="detail-label-semua">Tahun Terbit</span>
                    <span className="detail-value-semua">{selectedBuku.tahun_terbit}</span>
                  </div>
                  <div className="detail-item-semua">
                    <span className="detail-label-semua">Tebal Buku</span>
                    <span className="detail-value-semua">{selectedBuku.tebal_buku} halaman</span>
                  </div>
                  <div className="detail-item-semua">
                    <span className="detail-label-semua">Kategori</span>
                    <span className="detail-value-semua">{selectedBuku.kategori}</span>
                  </div>
                  <div className="detail-item full-width-semua">
                    <span className="detail-label-semua">Deskripsi</span>
                    <span className="detail-value-semua">{selectedBuku.deskripsi}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
}
