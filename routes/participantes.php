<?php

use App\Http\Controllers\ParticipanteController;
use App\Models\Participante;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Evento;
use Carbon\Carbon;

Route::post('participante-salvar', [ParticipanteController::class, 'store'])->name('participanteStore');
Route::get('cadastro-realizado/{id}', function ($id) {

    $participante = Participante::findOrFail($id);
    $participante->load(['eventos' => function ($query) {
        $query->wherePivot('status', 'inscrito')->latest();
    }]);


    return Inertia::render('participante/cadastro-realizado', [
        'participante' => $participante,
    ]);
})->name('cadastroRealizado');

Route::get('confirmar/presenca/{id}', function ($id) {
    $evento = Evento::findOrFail($id);

    $dataHoraEvento = Carbon::createFromFormat(
        'Y-m-d H:i:s',
        "{$evento->data_fim} {$evento->hora_fim}",
        'America/Sao_Paulo'
    );

    if (!$evento->qr_code_gerado || $dataHoraEvento->isPast()) {
        abort(404);
    }

    return Inertia::render('participante/confirmar-presenca', ['evento' => $evento]);
})->name('confirmarPresenca');


Route::put('salvar/presenca/{id}', [ParticipanteController::class, 'confirmarPresenca'])->name('salvarPresenca');
