<?php

namespace App\Http\Controllers;

use App\Models\Buku; // perhatikan huruf besar kecil
use Illuminate\Http\Request;

class BukuController extends Controller
{
    // ambil semua data buku
    public function index()
    {
        return response()->json(Buku::all(), 200);
    }

    // simpan data buku baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tahun_terbit' => 'required|integer',
            'tebal_buku' => 'nullable|integer',
            'cover' => 'nullable|string',
        ]);

        $buku = Buku::create($validated);
        return response()->json($buku, 201);
    }

    // ambil 1 data buku berdasarkan ID
    public function show($id)
    {
        $buku = Buku::find($id);
        if (!$buku) {
            return response()->json(['message' => 'Buku tidak ditemukan'], 404);
        }
        return response()->json($buku, 200);
    }

    // update buku
    public function update(Request $request, $id)
    {
        $buku = Buku::find($id);
        if (!$buku) {
            return response()->json(['message' => 'Buku tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'judul' => 'sometimes|string|max:255',
            'penulis' => 'sometimes|string|max:255',
            'penerbit' => 'sometimes|string|max:255',
            'kategori' => 'sometimes|string|max:255',
            'deskripsi' => 'nullable|string',
            'tahun_terbit' => 'sometimes|integer',
            'tebal_buku' => 'nullable|integer',
            'cover' => 'nullable|string',
        ]);

        $buku->update($validated);
        return response()->json($buku, 200);
    }

    // hapus buku
    public function destroy($id)
    {
        $buku = Buku::find($id);
        if (!$buku) {
            return response()->json(['message' => 'Buku tidak ditemukan'], 404);
        }

        $buku->delete();
        return response()->json(['message' => 'Buku berhasil dihapus'], 200);
    }
    

    //ambil jumlah data buku
    public function jumlahBuku()
    {
        $jumlahbuku = Buku::count(); //menghitung jumlah data buku dengan count()
        return response()->json(['jumlah' => $jumlahbuku]);
    }
}
