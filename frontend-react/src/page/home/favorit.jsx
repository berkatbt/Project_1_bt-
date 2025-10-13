import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../../firebase/firebase";
import "../../css/favorit.css"
import { count } from "firebase/firestore";

export default function FavoritPage() {
    const [favorit, setfavorit] = useState([]);
    const [loading, setLoading] = useState(true);
    


    const fecthFavorit = async (userUid) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/favorite/${userUid}`);
            setfavorit(res.data);
        } catch (err) {
            console.error("gagal mengambil data favorit", err)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fecthFavorit(user.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    //fungsi hapus favorit
    const hapusFavorit = async (bukuId) => {
        if (!auth.currentUser) {
            alert("Kamu harus login dulu!");
            return;
        }

        const userUid = auth.currentUser.uid;

        try {
            const res = await axios.delete("http://127.0.0.1:8000/api/favorite/remove", {
                data: {
                    user_uid: userUid,
                    buku_id: bukuId,
                },
            });

            alert(res.data.message);
            setfavorit((prev) => prev.filter((f) => f.buku.id !== bukuId));
        } catch (err) {
            console.error("Gagal menghapus favorit:", err);
            alert("Gagal menghapus favorite");
        }
    };

    //ambil jumlah favorit
        const [count, setCount] = useState(0);

        useEffect(() => {
            const fetchCount = async () => {
                if (!auth.currentUser) return; // pastikan user login

                try {
                    const userUid = auth.currentUser.uid;
                    const res = await axios.get(`http://127.0.0.1:8000/api/favorite/count/${userUid}`);
                    setCount(res.data.total_favorit); // simpan hasil ke state
                } catch (err) {
                    console.error("gagal mengambil jumlah favorit", err);
                }
            };

            fetchCount();
        }, []); // ✅ efek hanya jalan sekali saat komponen mount

    if (loading) return <p>memuat data favorit...</p>;

    if (favorit.length === 0)
        return <p>belum ada buku favofit</p>;

    return (
        <div className="book-favorites-container">
            <h2 className="section-title">📚 Buku Favorit Saya</h2>
            <div>
                <h2>favofit</h2>
                <p>{count}</p>
            </div>
            <div className="book-grid">
                {favorit.map((fav) => (
                    <div
                        key={fav.id}
                        className="book-card"
                    >
                        <img
                            src={fav.buku.cover || "/placeholder-book.jpg"}
                            alt={fav.buku.judul}
                            className="book-cover"
                        />
                        <h3 className="book-title">{fav.buku.judul}</h3>
                        <p className="book-author">{fav.buku.penulis}</p>
                        <button
                            onClick={() => hapusFavorit(fav.buku.id)}
                        >hapus</button>
                        <p className="book-category">{fav.buku.kategori}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
