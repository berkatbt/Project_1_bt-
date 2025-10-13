import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase/firebase";

export default function ProtectdRoute({children}) {
    const user = auth.currentUser; //ambil user aktif dari firebase

    //jika users belum login -> redirect ke halaman login
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    //jika user sudah login maka tampilak halaman aslinya
    return children;
 }