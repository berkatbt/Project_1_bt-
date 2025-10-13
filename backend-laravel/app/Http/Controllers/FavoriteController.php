<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    //tambah buku  ke favorit
    public function tambahFavorite(Request $request)
    {
        $request->validate([
            'user_uid' => 'required|string',
            'buku_id' => 'required|exists:buku,id'
        ]);

        $favorite = Favorite::firstOrCreate([
            'user_uid' => $request->user_uid,
            'buku_id' => $request->buku_id,
        ]);

        return response()->json([
            'message' => 'berhasil di tambah ke favorit!',
            'data' => $favorite
        ]);
    }

    public function menghapusFavorite(Request $request)
    {
        $request->validate([
            'user_uid' => 'required|string',
            'buku_id' => 'required|exists:buku,id',
        ]);

        Favorite::where('user_uid', $request->user_uid)
            ->where('buku_id', $request->buku_id)
            ->delete();

        return response() -> json([
            'message' => 'data berhasil di hapus'
        ]);
    }

    //tampilkan semua buku favorite
    public function semuaFavorites($user_uid)
    {
        $favorites = Favorite::where('user_uid', $user_uid)
            ->with('buku') // ambil juga detail buku-nya
            ->get();

        return response()->json($favorites);
    }
    

    //hitung jumlah favorit
    public function jumlahFavorit($user_uid)
    {
        $count = Favorite::where('user_uid', $user_uid)->count();

        return response()->json([
            'user_uid' => $user_uid,
            'total_favorit' => $count,
        ]);
    }
}
