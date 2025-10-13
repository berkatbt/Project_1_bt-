<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('favorit', function (Blueprint $table) {
            $table->id();
            $table->string('user_uid'); // ID user dari Firebase Auth
            $table->unsignedBigInteger('buku_id'); // ID buku dari tabel buku
            $table->timestamps();

            // Relasi ke tabel buku
            $table->foreign('buku_id')->references('id')->on('buku')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorit');
    }
};
