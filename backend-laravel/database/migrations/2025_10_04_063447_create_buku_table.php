<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use PhpParser\Node\Expr\FuncCall;

return new class extends Migration
{
    // membuat table data buku
    public function up(): void
    {
        Schema::create('buku', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('penulis');
            $table->string('penerbit');
            $table->string('kategori');
            $table->text('deskripsi')->nullable();
            $table->integer('tahun_terbit')->nullable();
            $table->integer('tebal_buku')->nullable();
            $table->string('cover')->nullable();
            $table->timestamps();
        });
    }
    
    public function down(): void 
    {
        Schema::dropIfExists('buku');
    }

};
