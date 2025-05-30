<?php

use App\Http\Controllers\EventoController;
use App\Models\Evento;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use \App\Http\Controllers\UsuarioController;

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {

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
            ],
            'app_url' => config('app.url'),
        ]);
    })->name('eventoShow');


    Route::put('evento/inativar/{evento}', [EventoController::class, 'destroy'])->name('inativarEvento');
    Route::put('evento/link-liberar/{id}', [EventoController::class, 'createLinkForSignUp'])->name('liberarLinkCadastro');
    Route::put('evento/criar-qrCode/{evento}', [EventoController::class, 'createQrCode'])->name('liberarQrCode');

    Route::post('evento/importar/participantes', [EventoController::class, 'importarParticipantes'])->name('importarParticipantes');

    Route::get('relatorios/participantes', [EventoController::class, 'relatorioView'])->name('relatorios');

    Route::post('relatorios/evento', [EventoController::class, 'gerarRelatorio'])->name('gerarRelatorio');

    Route::post('/relatorios/evento/exportar', [EventoController::class, 'exportarExcel'])->name('exportarExcel');

});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('validar-hash', [EventoController::class, 'showValidacaoForm'])->name('validarHashForm');
    Route::post('validar-hash', [EventoController::class, 'validarHash'])->name('validarHash');
});

Route::middleware(['auth', 'verified', 'role:admin,visualizador'])->group(function () {
    Route::get('evento/detalhes/{id}', [EventoController::class, 'detalhesEvento'])->name('detalhesEvento');
    Route::get('evento/detalhes/participantes/{id}', [EventoController::class, 'detalhesParticipante'])->name('detalheParticipantes');
});

Route::middleware(['auth', 'verified', 'role:visualizador'])->group(function () {
    Route::get('visualizador', [UsuarioController::class, 'visualizadorEventos'])->name('visualizadorEventos');
});

Route::get('evento/formulario-cadastro/{id}', function ($id) {

    $evento = Evento::with('atividades')->findOrFail($id);
    if (!$evento->link_liberado || !$evento->ativo) {
        abort(404);
    }

    return Inertia::render('events/evento-form-cadastro', [
        'evento' => $evento,
    ]);
})->name('cadastrarParticipante');
