<?php

use App\Http\Controllers\Auth\LdapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/login', function() {
       return Inertia::render('auth/login');
    })->name('login');
    Route::post('/login', [LdapController::class, 'login'])->name('login');
});

Route::get('/logout', [LdapController::class, 'logout'])->name('logout');
