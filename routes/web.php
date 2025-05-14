<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
     return redirect()->route('login');
 })->name('home');

 Route::middleware(['auth', 'verified'])->group(function () {
     Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
 });

require __DIR__ . '/events.php';
require __DIR__ . '/participantes.php';
require __DIR__.'/auth.php';
