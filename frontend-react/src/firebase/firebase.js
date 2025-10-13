// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";


// Konfigurasi Firebase project kamu
const firebaseConfig = {
  apiKey: "AIzaSyByfb9jBUArc6EJEqchkxY5IDAHs4Ity24",
  authDomain: "katalog-buku-2ddfb.firebaseapp.com",
  projectId: "katalog-buku-2ddfb",
  storageBucket: "katalog-buku-2ddfb.firebasestorage.app",
  messagingSenderId: "161602581907",
  appId: "1:161602581907:web:9e64ea4f02884c130e6466",
  measurementId: "G-M25FS3B0LC"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);