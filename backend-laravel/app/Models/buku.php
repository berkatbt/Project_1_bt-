<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Buku extends Model
{
    use HasFactory;

    protected $table = 'buku'; //nama tabel di databses

    protected $fillable = [
        'judul',
        'penulis',
        'penerbit',
        'kategori',
        'deskripsi',
        'tahun_terbit',
        'tebal_buku',
        'cover',
    ]; //sesuai kan dengan table di migration 
}
 