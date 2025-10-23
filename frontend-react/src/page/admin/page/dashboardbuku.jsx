import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../css/dashboardbuku.css";

export default function DashboardBuku() {
    const [buku, setBuku] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        id: "",
        judul: "",
        penulis: "",
        penerbit: "",
        kategori: "",
        deskripsi: "",
        tahun_terbit: "",
        tebal_buku: "",
        cover: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [modeEdit, setModeEdit] = useState(false);

    const ambilDataBuku = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/buku");
            setBuku(res.data);
        } catch (err) {
            console.error("Gagal mengambil data buku:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        ambilDataBuku();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTambah = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/buku", formData);
            alert("Buku berhasil ditambahkan!");
            setShowModal(false);
            ambilDataBuku();
            resetForm();
        } catch (err) {
            console.error("Gagal menambah buku:", err);
            alert("Gagal menambah buku!");
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/buku/${formData.id}`, formData);
            alert("Buku berhasil diperbarui!");
            setShowModal(false);
            ambilDataBuku();
            resetForm();
        } catch (err) {
            console.error("Gagal mengedit buku:", err);
            alert("Gagal memperbarui buku!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah kamu yakin ingin menghapus buku ini?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/buku/${id}`);
            alert("🗑️ Buku berhasil dihapus!");
            ambilDataBuku();
        } catch (err) {
            console.error("Gagal menghapus buku:", err);
            alert("Gagal menghapus buku!");
        }
    };

    const resetForm = () => {
        setFormData({
            id: "",
            judul: "",
            penulis: "",
            penerbit: "",
            kategori: "",
            deskripsi: "",
            tahun_terbit: "",
            tebal_buku: "",
            cover: "",
        });
        setModeEdit(false);
    };

    const bukaModalTambah = () => {
        resetForm();
        setShowModal(true);
    };

    const bukaModalEdit = (b) => {
        setFormData(b);
        setModeEdit(true);
        setShowModal(true);
    };

    

    if (loading) return <p style={{ textAlign: "center", color: "white" }}>Memuat data buku...</p>;

    return (
        <div className="dashboard-buku">
            <div className="dashboard-container">
                <div className="header-dashboard">
                    <h1>📚 Manajemen Buku</h1>
                    <button className="btn-tambah" onClick={bukaModalTambah}>
                        + Tambah Buku
                    </button>
                </div>

                <div className="tabel-wrapper">
                    <table className="tabel-buku">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Cover</th>
                                <th>Judul</th>
                                <th>Penulis</th>
                                <th>Penerbit</th>
                                <th>Kategori</th>
                                <th>Tahun</th>
                                <th>Tebal</th>
                                <th>Deskripsi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buku.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="kosong">Tidak ada data buku</td>
                                </tr>
                            ) : (
                                buku.map((b, i) => (
                                    <tr key={b.id}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <img
                                                src={b.cover || "https://via.placeholder.com/80x100?text=No+Cover"}
                                                alt={b.judul}
                                                className="cover-buku"
                                            />
                                        </td>
                                        <td>{b.judul}</td>
                                        <td>{b.penulis}</td>
                                        <td>{b.penerbit}</td>
                                        <td>{b.kategori}</td>
                                        <td>{b.tahun_terbit}</td>
                                        <td>{b.tebal_buku}</td>
                                        <td className="kolom-deskripsi">{b.deskripsi}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => bukaModalEdit(b)}>✏️</button>
                                            <button className="btn-hapus" onClick={() => handleDelete(b.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            {showModal && (
                <div className="overlay-modal" onClick={() => setShowModal(false)}>
                    <div className="modal-buku" onClick={(e) => e.stopPropagation()}>
                        <h2>{modeEdit ? "✏️ Edit Buku" : "➕ Tambah Buku"}</h2>
                        <form onSubmit={modeEdit ? handleEdit : handleTambah}>
                            <input type="text" name="judul" placeholder="Judul Buku" value={formData.judul} onChange={handleChange} required />
                            <input type="text" name="penulis" placeholder="Penulis" value={formData.penulis} onChange={handleChange} required />
                            <input type="text" name="penerbit" placeholder="Penerbit" value={formData.penerbit} onChange={handleChange} required />
                            <select
                                className="pilih-kategori-buku"
                                name="kategori"
                                value={formData.kategori}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Pilih Kategori --</option>
                                <option value="Fiksi">Fiksi</option>
                                <option value="Non-Fiksi">Non-Fiksi</option>
                                <option value="Edukasi">Edukasi</option>
                                <option value="Komik">Komik</option>
                                <option value="Biografi">Biografi</option>
                                <option value="Religi">Religi</option>
                                <option value="Teknologi">Teknologi</option>
                                <option value="Novel">Novel</option>
                                <option value="Sejarah">Sejarah</option>
                            </select>

                            <input type="number" name="tahun_terbit" placeholder="Tahun Terbit" value={formData.tahun_terbit} onChange={handleChange} required />
                            <input type="number" name="tebal_buku" placeholder="Tebal Buku" value={formData.tebal_buku} onChange={handleChange} />
                            <input type="text" name="cover" placeholder="URL Cover Buku" value={formData.cover} onChange={handleChange} />
                            <textarea name="deskripsi" placeholder="Deskripsi Buku" value={formData.deskripsi} onChange={handleChange}></textarea>

                            <div className="tombol-modal">
                                <button type="submit" className="btn-simpan">{modeEdit ? "Simpan Perubahan" : "Tambah Buku"}</button>
                                <button type="button" className="btn-batal" onClick={() => setShowModal(false)}>Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
