<?php

use App\Http\Controllers\Auth\ParticipantAuthController;
use App\Http\Controllers\ParticipanteAuthController;
use App\Http\Controllers\ParticipanteController;
use App\Models\Evento;
use App\Models\Participante;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('participante-salvar', [ParticipanteController::class, 'store'])->name('participanteStore');
Route::get('cadastro-realizado/{id}', function ($id) {

    $participante = Participante::findOrFail($id);
    $participante->load(['eventos' => function ($query) {
        $query->wherePivot('status', 'inscrito')->latest();
    }]);


    return Inertia::render('participante/cadastro-realizado', [
        'participante' => [
            'id' => $participante->id,
            'nome' => $participante->nome,
            'eventos' => $participante->eventos->map(function ($evento) {
                return [
                    'id' => $evento->id,
                    'nome' => $evento->nome,
                    'data_inicio' => $evento->data_inicio,
                    'local_do_evento' => $evento->local_do_evento,
                ];
            }),
        ],
    ]);

})->name('cadastroRealizado');

Route::get('confirmar/presenca/{id}', function ($id) {
    $evento = Evento::findOrFail($id);

    $dataHoraEvento = Carbon::createFromFormat(
        'Y-m-d H:i:s',
        "{$evento->data_fim} {$evento->hora_fim}",
        'America/Sao_Paulo'
    );

    if (!$evento->qr_code_gerado || $dataHoraEvento->isPast() || !$evento->ativo) {
        abort(404);
    }

    return Inertia::render('participante/confirmar-presenca', ['evento' => $evento]);
})->name('confirmarPresenca');

Route::put('salvar/presenca/{id}', [ParticipanteController::class, 'confirmarPresenca'])->name('salvarPresenca');

Route::get('confirmacao-feita/{id}', function ($id) {
    $participante = Participante::findOrFail($id);
    $participante->load(['eventos' => function ($query) {
        $query->wherePivot('status', 'confirmado')->latest();
    }]);


    return Inertia::render('participante/confirmacao-realizada', [
        'participante' => [
            'id' => $participante->id,
            'nome' => $participante->nome,
            'eventos' => $participante->eventos->map(function ($evento) {
                return [
                    'id' => $evento->id,
                    'nome' => $evento->nome,
                ];
            }),
        ],
    ]);
})->name('confirmacaoFeita');

// Rotas de login do participante (guest para o guard “participante”)
Route::middleware('guest:participante')->group(function () {
    Route::get('participante/login', [ParticipanteAuthController::class, 'showLogin'])
        ->name('participanteLogin');
    Route::post('participante/login/cpf', [ParticipanteAuthController::class, 'checkCpf']);
    Route::post('participante/login/otp', [ParticipanteAuthController::class, 'verifyOtp']);
    Route::post('participante/login/resend-otp', [ParticipanteAuthController::class, 'resendOtp']);
});

// Rotas protegidas pelo guard “participante” (somente usuários logados como participante)
Route::middleware('auth:participante')->group(function () {
    Route::get('participante/eventos', [ParticipanteController::class, 'eventosCadastrados'])
        ->name('participanteEventos');
});
