<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = ['user_uid', 'buku_id'];

    public function buku()
    {
        return $this->belongsTo(Buku::class, 'buku_id');
    }
}
