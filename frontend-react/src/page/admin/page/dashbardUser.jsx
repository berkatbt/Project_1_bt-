import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDatabase, ref, onDisconnect, set } from "firebase/database";
import { db, auth } from "../../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../../../css/dashboardusers.css";

function DashboardHome() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const rtdb = getDatabase();

  // 🔹 Ambil semua user dari Firestore (real-time)
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

  // 🔹 Pantau user login saat ini dari Firebase Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // 🔹 Update status online/offline (khusus akun biasa juga)
  useEffect(() => {
    if (!currentUser) return;

    const userStatusRef = ref(rtdb, `/status/${currentUser.uid}`);

    const updateStatus = async () => {
      try {
        // set online di Realtime DB
        await set(userStatusRef, {
          state: "online",
          last_changed: Date.now(),
        });

        // kalau tab ditutup atau user disconnect
        onDisconnect(userStatusRef).set({
          state: "offline",
          last_changed: Date.now(),
        });

        // set online di Firestore
        await updateDoc(doc(db, "Users", currentUser.uid), { isOnline: true });
      } catch (error) {
        console.error("Gagal update status:", error);
      }
    };

    updateStatus();

    // saat komponen unmount, set offline
    return async () => {
      try {
        await set(userStatusRef, {
          state: "offline",
          last_changed: Date.now(),
        });
        await updateDoc(doc(db, "Users", currentUser.uid), { isOnline: false });
      } catch {}
    };
  }, [currentUser, rtdb]);

  // 🔹 Fungsi hapus user
  const handleDelete = async (userId) => {
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

  if (loading) {
    return <p style={{ textAlign: "center" }}>Memuat data users...</p>;
  }

  // 🔹 Hitung jumlah online dan offline
  const onlineCount = users.filter((u) => u.isOnline).length;
  const offlineCount = users.filter((u) => !u.isOnline).length;

  return (
    <div className="dashboard-container-data-users">
      <h2 className="dashboard-title-activity-data-users">Dashboard User Activity</h2>
      <p><strong>Online:</strong> {onlineCount}</p>
      <p><strong>Offline:</strong> {offlineCount}</p>

      <div className="table-responsive-wrapper-data-users">
        <table className="users-table-data-users">
          <thead>
            <tr>
              <th>NO</th>
              <th>NAMA</th>
              <th>EMAIL</th>
              <th>STATUS</th>
              <th>LAST LOGIN</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                <td>{index + 1}</td>
                <td className="name-cell-data-users">{user.displayName || "Tanpa Nama"}</td>
                <td className="email-cell-data-users">{user.email}</td>
                <td>
                  <span className={`status-badge ${user.isOnline ? "online" : "offline"}`}>
                    {user.isOnline ? "🟢 Online" : "⚫ Offline"}
                  </span>
                </td>
                <td className="last-login-cell-data-users">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
                </td>
                <td>
                  <button className="delete-btn-data-users" onClick={() => handleDelete(user.id)}>
                    🗑 Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardHome;
