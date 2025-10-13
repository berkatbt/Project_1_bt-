import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/home/home.jsx";
import Login from "./page/auth/loginUser.jsx";
import SemuaBuku from "./page/home/semua_buku.jsx";
import RegisterUsers from "./page/auth/registerUser.jsx";
import ProtectedRoute from "./ProtectedRoute.js";
import LayoutDash from "./page/admin/Sidebar.jsx";
import Dashboard_home from "./page/admin/page/dashboard_home.jsx";
import DashboardUsers from "./page/admin/page/dashbardUser.jsx";
import LoginAdmin from "./page/auth/loginAdmin.jsx";
import DashboardBuku from "./page/admin/page/dashboardbuku.jsx";
import FavoritPage from "./page/home/favorit.jsx";

function App() {
  return (  
    <Router>
      <Routes>
        {/* 🔒 Home hanya bisa diakses setelah login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/* 🔐 Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/semua" element={<SemuaBuku />} />
        <Route path="/register" element={<RegisterUsers />} />
        <Route path="/loginAdmin" element={<LoginAdmin/>}/>
        <Route path="/favorit" element={<FavoritPage/>} />
        
        {/* Route dasboard */},
        <Route path="/dashboard" element={<LayoutDash/>}>
          <Route index element={<Dashboard_home/>}/>
          <Route path="Users" element={<DashboardUsers/>}/>
          <Route path="Buku" element={<DashboardBuku/>}/>
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
