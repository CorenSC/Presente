<?php

use App\Http\Controllers\EventoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    // Eventos
    Route::get('eventos', function () {
        return Inertia::render('events/eventos');
    })->name('eventos');

    Route::get('criar-evento', function () {
        return Inertia::render('events/criar-evento');
    })->name('criarEvento');

    Route::post('eventos-salvar', [EventoController::class, 'store'])->name('eventoStore');
});
