<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use \App\Models\User;

Route::get('/', function () {
     return redirect()->route('login');
 })->name('home');

 Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
     Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
 });

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios');
    Route::get('/usuarios/editar/{id}', function ($id) {
        $user = User::class;
        return \Inertia\Inertia::render('usuarios/editar-usuario', [
           'usuario' =>  $user::findOrFail($id),
        ]);
    })->name('editarUsuario');
    Route::put('/usuarios/{user}', [UsuarioController::class, 'atualizar'])->name('usuarioAtualizar');
});

require __DIR__ . '/events.php';
require __DIR__ . '/participantes.php';
require __DIR__.'/auth.php';
