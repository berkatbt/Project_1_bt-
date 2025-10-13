import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../../../css/dashHome.css";
import "../../../css/statistik.css"


export default function Dashboard_home() {
    const [jumlahBuku, setJumlahBuku] = useState(0);
    const [jumlahUser, setJumlahUsers] = useState(0);
    const [jumlahUserAktif, setJumlahUsersAktif] = useState(0);
    const [statistik, setStatistik] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ambil jumlah buku
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/jumlahBuku')
            .then(res => setJumlahBuku(res.data.jumlah))
            .catch(err => console.error(err));
    }, []);

    // Ambil jumlah user
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(db, "pengguna"));
                setJumlahUsers(snapshot.size);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, []);

    // Ambil statistik pengunjung
    useEffect(() => {
        const fetchStatistik = async () => {
            try {
                const snapshot = await getDocs(collection(db, "pengunjung"));
                const data = snapshot.docs.map(doc => doc.data());

                // Kelompokkan berdasarkan tanggal
                const grouped = data.reduce((acc, item) => {
                    acc[item.tanggal] = (acc[item.tanggal] || 0) + 1;
                    return acc;
                }, {});

                // Konversi ke array untuk chart
                const result = Object.entries(grouped).map(([tanggal, jumlah]) => ({
                    tanggal,
                    jumlah
                }));

                setStatistik(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatistik();
    }, []);

    //ambil jumlah data users yang aktif
    useEffect(() => {
        const fetchUsersAkfit = async () => {
            try{
                const q = query(collection(db, "Users"), where("isOnline", "==", true));
                const snapshot = await getDocs(q);
                setJumlahUsersAktif(snapshot.size) //jumlah dukomen yang online
            } catch (error) {
                console.error("error :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsersAkfit();
    })


    if (loading) return <p>Loading...</p>;

    return (
        <div className="body-halaman-dashboard">
            <h1 className="judul-halaman-dashboard">Dashboard</h1>

            <div className="datah-jumlah-container">
                {/* Card Buku */}
                <div className="stat-card buku-card">
                    <div className="stat-icon-wrapper">
                        <img src="/svg/book-bookmark.svg" alt="Icon Buku" />
                    </div>
                    <div className="stat-info">
                        <h2>Buku</h2>
                        <p className="stat-number">{jumlahBuku}</p>
                    </div>
                </div>

                {/* Card Users */}
                <div className="stat-card user-card">
                    <div className="stat-icon-wrapper">
                        <img src="\svg\user-pen.svg" alt="Icon User" />
                    </div>
                    <div className="stat-info">
                        <h2>Users</h2>
                        <p className="stat-number">{jumlahUser}</p>
                    </div>
                </div>

               <div className="stat-card user-card">
                    <div className="stat-icon-wrapper">
                        <img src="\svg\user-pen.svg" alt="Icon User" />
                    </div>
                    <div className="stat-info">
                        <h2>Aktif</h2>
                        <p className="stat-number">{jumlahUserAktif}</p>
                    </div>
                </div>
            </div>

            <section className="section-img-video-dashboard video-background-container">
                <video
                    className="dashboard-video" /* Tambahkan kelas untuk styling */
                    src="/video/Zenitsu _Agatsuma_4k.mp4"
                    loop
                    autoPlay
                    muted
                    playsInline
                />
                {/* Tambahkan elemen untuk overlay gelap */}
                <div className="video-overlay"></div>

                {/* Di sini adalah tempat kamu meletakkan konten dashboard kamu (misalnya, teks, kartu, dll.) */}
                <div className="dashboard-content">
                    <h1>Selamat Datang, <span>Admin!</span></h1>
                    {/* ... komponen dashboard lainnya ... */}
                </div>
            </section>

            {/* // Ganti 'bw' (Black & White) menjadi 'futuristic-dark' */}
            <section className="statistik-section futuristic-dark">
                {/* Mengganti judul agar lebih "eye-catching" dengan aksen warna */}
                <h2 className="statistik-title">Statistik Pengunjung <span className="highlight-text">Harian</span></h2>
                <ResponsiveContainer width="95%" height={250}>
                    <BarChart
                        data={statistik}
                        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                        {/* Mengubah tampilan grid menjadi lebih halus */}
                        <CartesianGrid strokeDasharray="5 5" stroke="#ffffffff" vertical={false} />

                        {/* Mengganti warna teks pada sumbu X dan Y */}
                        <XAxis dataKey="tanggal" stroke="#000000ff" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis stroke="#000000ff" tickLine={false} axisLine={false} fontSize={12} />

                        {/* Mengubah style Tooltip agar transparan dan modern */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(0, 0, 0, 0.9)", // Background lebih gelap & transparan
                                borderRadius: "8px",
                                border: "1px solid #f8f8f8ff", // Border aksen neon ungu
                                backdropFilter: "blur(5px)", // Efek blur untuk Tooltip
                                
                            }}
                            itemStyle={{ color: "#ffffffff", fontSize: "14px", fontWeight: "bold" }} // Teks neon cyan
                        />
                        <Bar
                            dataKey="jumlah"
                            // Menggunakan ID gradien yang akan kita definisikan di CSS
                            fill="url(#gradientBar)"
                            radius={[6, 6, 0, 0]} // Sudut yang lebih membulat
                            animationDuration={1500} // Animasi yang lebih lambat untuk efek keren
                        />
                    </BarChart>
                </ResponsiveContainer>

                {/* Definisikan gradien di dalam SVG untuk BarChart (ini adalah cara Recharts menangani gradien) */}
                <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                    <defs>
                        <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#666666ff" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#000000ff" stopOpacity={0.9} />
                        </linearGradient>
                    </defs>
                </svg>
            </section>

            <section>
                 
            </section>

        </div>
    );
}
