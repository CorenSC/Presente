<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AulasConcluidas;
use App\Models\Aula;
use App\Models\Evento;
use App\Models\EventoParticipante;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CursoOverviewController extends Controller
{
    public function show(Evento $evento)
    {
        $participante = Auth::guard('participante')->user();

        $inscricao = EventoParticipante::where('evento_id', $evento->id)
            ->where('participante_id', $participante->id)
            ->firstOrFail();

        $curso = $evento->curso()->firstOrFail();

        $curso->load([
            'modulos' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aula' => fn ($q) => $q->orderBy('ordem'),
        ]);

        // só publicadas
        $modulos = $curso->modulos->map(function ($m) {
            $aulas = $m->aula->where('publicada', true)->values();

            return [
                'id' => $m->id,
                'nome' => $m->nome,
                'ordem' => $m->ordem,
                'aulas' => $aulas->map(fn ($a) => [
                    'id' => $a->id,
                    'titulo' => $a->titulo,
                    'ordem' => $a->ordem,
                ])->values(),
            ];
        })->values();

        // flat pra bloqueio
        $flatIds = collect();
        foreach ($modulos as $m) {
            foreach ($m['aulas'] as $a) {
                $flatIds->push((int)$a['id']);
            }
        }

        $concluidasIds = AulasConcluidas::where('inscrito_id', $inscricao->id)
            ->pluck('aula_id')
            ->map(fn ($v) => (int)$v)
            ->values();

        // unlockedIndex: até onde pode acessar
        $unlockedIndex = 0;
        for ($i = 0; $i < $flatIds->count(); $i++) {
            if ($i === 0 || $concluidasIds->contains($flatIds[$i - 1])) {
                $unlockedIndex = $i;
            } else {
                break;
            }
        }

        return Inertia::render('participante/curso-overview', [
            'evento' => [
                'id' => $evento->id,
                'nome' => $evento->nome,
            ],
            'curso' => [
                'id' => $curso->id,
                'nome' => $curso->nome,
                'descricao' => $curso->descricao,
                'carga_horaria' => $curso->carga_horaria,
            ],
            'modulos' => $modulos,
            'concluidasIds' => $concluidasIds,
            'unlockedIndex' => $unlockedIndex,
        ]);
    }
}
