import React, { useState, useEffect } from "react";
import axios, { Axios } from "axios";
import { db, auth } from "../../../firebase/firebase";
import { collection, getDocs, query, where, doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { getDatabase, ref, onDisconnect, set } from "firebase/database";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import LoadingSpinner from "../../../hooks/LoadingSpinner";

export default function Beranda_Dashboard() {
    const [jumlahBuku, setJumlahBuku] = useState(0);
    const [jumlahUser, setJumlahUser] = useState(0);
    const [jumlahUserAktif, setJumlahUserAktif] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buku, setBuku] = useState([]);
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

    const [users, setUsers] = useState([]);
    const rtdb = getDatabase();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "Users"), (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const userStatusRef = ref(rtdb, `/status/${currentUser.uid}`);

        const updateStatus = async () => {
            try {
                await set(userStatusRef, {
                    state: "online",
                    last_changed: Date.now(),
                });

                onDisconnect(userStatusRef).set({
                    state: "offline",
                    last_changed: Date.now(),
                });

                await updateDoc(doc(db, "Users", currentUser.uid), { isOnline: true });
            } catch (error) {
                console.error("Gagal update status:", error);
            }
        };

        updateStatus();

        return async () => {
            try {
                await set(userStatusRef, {
                    state: "offline",
                    last_changed: Date.now(),
                });
                await updateDoc(doc(db, "Users", currentUser.uid), { isOnline: false });
            } catch { }
        };
    }, [currentUser, rtdb]);

    const handleDeleteUsers = async (userId) => {
        const confirmDelete = window.confirm("Yakin ingin menghapus user ini?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "Users", userId));
            alert("User berhasil dihapus!");
        } catch (error) {
            console.error("Gagal menghapus user:", error);
            alert("Terjadi kesalahan saat menghapus user.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Gunakan Promise.all untuk parallel requests
                const [bukuResponse, userSnapshot, activeUserSnapshot] = await Promise.all([
                    // Jumlah buku
                    axios.get('http://127.0.0.1:8000/api/jumlahBuku').catch(err => {
                        console.error("Error fetching books:", err);
                        return { data: { jumlah: 0 } }; // Return default value
                    }),

                    // Jumlah user
                    getDocs(collection(db, "pengguna")).catch(err => {
                        console.error("Error fetching users:", err);
                        return { size: 0 }; // Return default value
                    }),

                    // User aktif
                    getDocs(query(collection(db, "Users"), where("isOnline", "==", true))).catch(err => {
                        console.error("Error fetching active users:", err);
                        return { size: 0 }; // Return default value
                    })
                ]);

                setJumlahBuku(bukuResponse.data.jumlah);
                setJumlahUser(userSnapshot.size);
                setJumlahUserAktif(activeUserSnapshot.size);

            } catch (error) {
                console.error("Error in fetchData:", error);
                setError("Gagal memuat data dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    //ambil data buku
    const ambilDataBuku = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/buku");
            setBuku(res.data); // menyimpan hasil respons ke state 'buku'
        } catch (err) {
            console.error("Gagal Mengambil data buku:", err);
        } finally {
            setLoading(false) //apapun hasilnya (sukses/gagal), loding di matikan
        }
    };

    useEffect(() => {
        ambilDataBuku(); //panggil salagi saat komponents pertama kali di render
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

    if (loading) {
        return (
            <div className="p-5 font-sans flex flex-col items-center justify-center min-h-screen">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                    <div className="flex gap-5">
                        <div className="w-32 h-24 bg-gray-200 rounded"></div>
                        <div className="w-32 h-24 bg-gray-200 rounded"></div>
                        <div className="w-32 h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="min-h-[200px] flex items-center justify-center">
                        {loading ? <LoadingSpinner size={80} stroke={7} color="#60A5FA" text="Memuat data..." /> : <div>Konten</div>}
                    </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 font-sans flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 text-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="fixed flex items-center min-h-screen justify-end bg-wite w-[1630px]">

            <div className="fixed w-[1600px] h-screen text-white flex justify-start ">
                {/* Header Dashboard */}
                <div className="fixed text-center h-[110px] w-[600px] rounded-2xl mt-8 ml-8">
                    <h1 className="text-3xl font-extrabold text-blue-500 mt-4 tracking-wide">
                        Dashboard Manajemen Perpustakaan
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm italic">
                        Ringkasan cepat dan metrik utama sistem Anda
                    </p>
                </div>

                {/* Card Statistik */}
                <div className="fixed flex mt-32 ml-10 gap-6 bg-blue-[] h-[90px] w-[700px]">
                    {/* Card Jumlah Buku */}
                    {/* ================== */}
                    <div className="flex items-center bg-white text-black h-[90px] w-[220px] rounded-2xl shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-2">
                        {/* Ikon */}
                        <div className="bg-blue-500 h-[50px] w-[50px] rounded-full flex justify-center items-center ml-4 shadow-md ">
                            <svg
                                className="w-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>

                        {/* Teks */}
                        <div className="flex flex-col ml-4">
                            <h3 className="text-blue-600 text-sm font-semibold">
                                Jumlah Buku
                            </h3>
                            <p className="text-gray-800 text-2xl font-extrabold">
                                {jumlahBuku}
                            </p>
                        </div>
                    </div>

                    {/* ================== */}
                    <div className="flex items-center bg-white text-black h-[90px] w-[220px] rounded-2xl shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-2">
                        {/* Ikon */}
                        <div className="bg-yellow-400 h-[50px] w-[50px] rounded-full flex justify-center items-center ml-4 shadow-md ">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>

                        {/* Teks */}
                        <div className="flex flex-col ml-4">
                            <h3 className="text-yellow-400 text-sm font-semibold">
                                Users
                            </h3>
                            <p className="text-gray-800 text-2xl font-extrabold">
                                {jumlahUser}
                            </p>
                        </div>
                    </div>
                    {/* ================== */}
                    <div className="flex items-center bg-white text-black h-[90px] w-[220px] rounded-2xl shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-2">
                        {/* Ikon */}
                        <div className="bg-green-500 h-[50px] w-[50px] rounded-full flex justify-center items-center ml-4 shadow-md ">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        {/* Teks */}
                        <div className="flex flex-col ml-4">
                            <h3 className="text-green-600 text-sm font-semibold">
                                Online
                            </h3>
                            <p className="text-gray-800 text-2xl font-extrabold">
                                {jumlahUserAktif}
                            </p>
                        </div>
                    </div>

                </div>
                <section className=" fixed mt-[250px] h-[650px] w-[700px] rounded-2xl bg-white shadow-2xl ml-10">
                    <p className="text-blue-400 text-3xl font-bold mt-3 ml-5">Online/Offline</p>
                    <div className="space-y-3 overflow-y-auto max-h-[580px] mt-4 px-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-full">
                        {users.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    y: 1,
                                    scale: 1
                                }}
                                transition={{
                                    delay: index * 0.03,
                                    duration: 0.4,
                                    ease: [0.15, 0.36, 0.45, 0.94],
                                    y: { type: "spring", stiffness: 200, damping: 24 }
                                }}
                                whileHover={{
                                    //scale: 1.02,
                                    //y: -2,
                                    transition: {
                                        //duration: 0.2,
                                        ease: "easeOut"
                                    }
                                }}
                                whileTap={{
                                    scale: 0.98,
                                    transition: { duration: 0.1 }
                                }}
                                className="flex justify-between items-center bg-white from-slate-700/70 to-slate-600/50   p-3 rounded-2xl shadow-lg border border-slate-600/30 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.1,
                                            rotate: 5,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="relative"
                                    >
                                        <img
                                            src={"/Users-person.png"}
                                            alt="Foto Profil"
                                            className="w-12 h-12 rounded-full border-2 border-blue-400/80 object-cover shadow-md"
                                        />
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.03 + 0.2 }}
                                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-800 ${user.isOnline
                                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                                : "bg-gradient-to-r from-gray-400 to-gray-500"
                                                } shadow-sm`}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.03 + 0.1 }}
                                        className="space-y-1"
                                    >
                                        <h3 className="text-black font-semibold  group-hover:text-blue-400 transition-colors duration-300">
                                            {user.displayName || "Users"}
                                        </h3>
                                        <p className="text-gray-700 text-sm font-light group-hover:text-blue-500 transition-colors duration-300">
                                            {user.email || "Tidak ada email"}
                                        </p>
                                    </motion.div>
                                </div>

                                <motion.div
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 2, x: 0 }}
                                //transition={{ delay: index * 0.03 + 0.15 }}
                                >
                                    <motion.div
                                        //whileHover={{ scale: 0.0 }}
                                        //transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        className="flex flex-col items-center"
                                    >
                                        <span
                                            className={`h-4 w-4 rounded-full shadow-sm ${user.isOnline
                                                ? "bg-green-400 animate-pulse"
                                                : "bg-gray-400"
                                                }`}
                                            title={user.isOnline ? "Online" : "Offline"}
                                        />
                                        <span className="text-xs text-gray-700 mt-1 opacity-0 group-hover:opacity-50 transition-opacity duration-100">
                                            {user.isOnline ? "Online" : "Offline"}
                                        </span>
                                    </motion.div>

                                    <motion.button
                                        onClick={() => handleDeleteUsers(user.id)}
                                        whileHover={{
                                            scale: 1.05,
                                            backgroundColor: "#dc2626",
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{
                                            scale: 0.95,
                                            transition: { duration: 0.1 }
                                        }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 + 0.2 }}
                                        className="bg-red-600/90 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-red-500/20 transition-all duration-300 backdrop-blur-sm font-medium flex items-center gap-2 group/button"
                                    >
                                        <motion.svg
                                            whileHover={{ rotate: 90 }}
                                            transition={{ duration: 0.3 }}
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </motion.svg>
                                        Hapus
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
            {/* Tampilan data buku */}
            <section className="bg-white w-[830px] h-[850px] fixed rounded-xl shadow-2xl justify-center">
                <h3 className="text-blue-500 font-bold text-3xl ml-5 mt-3">data buku</h3>
                {loading ? (
                    <p className="text-center text-gray-500">Memuat data buku...</p>
                ) : (
                    <motion.div
                        className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        {buku.length > 0 ? (
                            buku.map((b, index) => (
                                <motion.div
                                    key={b.id}
                                    className="flex items-center justify-between bg-white p-4 mb-3 rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={b.cover || "/default-book.jpg"}
                                            alt={b.judul}
                                            className="w-16 h-20 object-cover rounded-md shadow-sm"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-600">{b.judul}</h3>
                                            <p className="text-gray-600 text-sm">{b.penulis}</p>
                                            <p className="text-gray-500 text-xs italic">{b.kategori}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => bukaModalEdit(b)}
                                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400">Tidak ada data buku.</p>
                        )}
                    </motion.div>
                )}
            </section>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-w-[90%] animate-fadeIn">
                        <h2 className="text-xl font-bold text-blue-400 mb-4 text-center">
                            ✏️ Edit Data Buku
                        </h2>

                        <form onSubmit={handleEdit} className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-700 font-semibold">
                                    Judul Buku
                                </label>
                                <input
                                    type="text"
                                    name="judul"
                                    value={formData.judul}
                                    onChange={handleChange}
                                    className="w-full border border-blue-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-gray-700 font-semibold">
                                        Penulis
                                    </label>
                                    <input
                                        type="text"
                                        name="penulis"
                                        value={formData.penulis}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 font-semibold">
                                        Penerbit
                                    </label>
                                    <input
                                        type="text"
                                        name="penerbit"
                                        value={formData.penerbit}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-gray-700 font-semibold">
                                        Tahun Terbit
                                    </label>
                                    <input
                                        type="number"
                                        name="tahun_terbit"
                                        value={formData.tahun_terbit}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700 font-semibold">
                                        Tebal Buku
                                    </label>
                                    <input
                                        type="text"
                                        name="tebal_buku"
                                        value={formData.tebal_buku}
                                        onChange={handleChange}
                                        className="w-full border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-700 font-semibold">
                                    Kategori
                                </label>
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    className="w-full border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 bg-white"
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
                            </div>
                            <div>
                                <label className="text-sm text-gray-700 font-semibold">
                                    Deskripsi
                                </label>
                                <textarea
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                ></textarea>
                            </div>

                            <div>
                                <label className="text-sm text-gray-700 font-semibold">
                                    Link Cover Buku
                                </label>
                                <input
                                    type="text"
                                    name="cover"
                                    value={formData.cover}
                                    onChange={handleChange}
                                    className="w-full border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-400 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
