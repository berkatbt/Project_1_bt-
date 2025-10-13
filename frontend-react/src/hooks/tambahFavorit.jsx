import axios from "axios";
import { auth } from "../firebase/firebase";

export default async function tambahFavorit(bukuId) {
  if (!auth.currentUser) {
    alert("Kamu harus login dulu!");
    return;
  }

  const userUid = auth.currentUser.uid;

  try {
    const res = await axios.post("http://127.0.0.1:8000/api/favorite/add", {
      user_uid: userUid,
      buku_id: bukuId,
    });
    alert(res.data.message);
  } catch (err) {
    console.error("Gagal menambah ke favorit:", err);
    alert("Gagal menambah ke favorit");
  }
}
