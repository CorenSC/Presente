<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

 Route::get('/', function () {
     return redirect()->route('login');
 })->name('home');

 Route::middleware(['auth', 'verified'])->group(function () {
     Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
 });

require __DIR__ . '/events.php';
require __DIR__.'/auth.php';
