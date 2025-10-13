<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BukuController;
use App\Http\Controllers\FavoriteController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('buku', BukuController::class);
Route::get('/jumlahBuku', [BukuController::class, 'jumlahBuku']);


Route::post('/favorite/add', [FavoriteController::class, 'tambahFavorite']);
Route::delete('/favorite/remove', [FavoriteController::class, 'menghapusFavorite']);
Route::get('/favorite/{user_uid}', [FavoriteController::class, 'semuaFavorites']);
Route::get('/favorite/count/{user_uid}', [FavoriteController::class, 'jumlahFavorit']);
