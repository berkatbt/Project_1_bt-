import React, { useEffect, useState } from "react";
import { auth, db, } from "../../firebase/firebase";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";

import "../../css/sidebar.css";

function LayoutDash() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    <div>
      <div className="sidebar">
        <div className="sidebar-header">
          {/* <div className="border-profil-admin">
            <img
              src={user?.photoURL || "/default-avatar.png"}
              alt="Foto Profil"
              className="profil-img"
            />
            <div>
              
            </div>
          </div> */}
        </div>
        <h2 className="Judul-text-admin">Dashboard</h2>
        <nav className="nav-menu-admin">
          <ul>
            <li>
              <Link to="/dashboard">
                <img src="/svg/stats.svg" alt="Dashboard Icon" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/dashboard/Buku">
                <img src="/svg/book-bookmark.svg" alt="Data Buku Icon" />
                Data Buku
              </Link>
            </li>
            <li>
              <Link to="/dashboard/Users">
                <img src="/svg/user-pen.svg" alt="Data Users Icon" />
                Data Users
              </Link>
            </li>
            <li>
              <a href="#">
                <img src="/svg/house-chimney.svg" alt="Settings Icon" />
                Home
              </a>
            </li>
          </ul>
        </nav>

        <div className="button-logout-admin">
          <button onClick={handleLogout}>Keluar</button>
        </div>
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutDash;
