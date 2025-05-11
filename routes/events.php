<?php

use App\Http\Controllers\EventoController;
use App\Models\Evento;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('eventos', function () {
        return Inertia::render('events/eventos');
    })->name('eventos');

    Route::get('listar/eventos', [EventoController::class, 'list'])->name('listarEventos');

    Route::get('criar-evento', function () {
        return Inertia::render('events/criar-evento');
    })->name('criarEvento');

    Route::get('editar-evento/{id}', function ($id) {
        return Inertia::render('events/editar-evento', [
            'evento' => Evento::with('atividades')->findOrFail($id)
        ]);
    })->name('editarEvento');

    Route::post('eventos-salvar', [EventoController::class, 'store'])->name('eventoStore');

    Route::put('eventos-atualizar/{evento}', [EventoController::class, 'update'])->name('eventoUpdate');

    Route::get('evento/{id}', function ($id) {
        return Inertia::render('events/evento-show', [
            'evento' => Evento::with('atividades')->findOrFail($id),
            'flash' => [
                'success' => Session::get('success'),
            ]
        ]);
    })->name('eventoShow');


    Route::put('evento/inativar/{evento}', [EventoController::class, 'destroy'])->name('inativarEvento');
    Route::put('evento/link-liberar/{id}', [EventoController::class, 'createLinkForSignUp'])->name('liberarLinkCadastro');
    Route::put('evento/criar-qrCode/{evento}', [EventoController::class, 'createQrCode'])->name('liberarQrCode');
    Route::get('evento/formulario-cadastro/{id}', function ($id) {

        $evento = Evento::findOrFail($id);
        if (!$evento->link_liberado) {
            abort(404);
        }

        return Inertia::render('events/evento-form-cadastro', [
            'evento' => $evento,
        ]);
    })->name('cadastrarParticipante');
});
