<?php

use App\Http\Controllers\ParticipanteController;
use App\Models\Evento;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('participante-salvar', [ParticipanteController::class, 'store'])->name('participanteStore');
});
