<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Aula;
use App\Models\AulasConcluidas;
use App\Models\Evento;
use App\Models\EventoParticipante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CursoPlayerOficialController extends Controller
{
    public function show(Request $request, Evento $evento)
    {
        $participante = Auth::guard('participante')->user();

        $inscricao = EventoParticipante::where('evento_id', $evento->id)
            ->where('participante_id', $participante->id)
            ->firstOrFail();

        $curso = $evento->curso()->firstOrFail();

        $curso->load([
            'modulos' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aula' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aula.conteudos' => fn ($q) => $q->orderBy('ordem'),
        ]);

        // só publicadas
        $modulos = $curso->modulos->map(function ($m) {
            $aulasPublicadas = $m->aula->where('publicada', true)->values();

            return [
                'id' => $m->id,
                'nome' => $m->nome,
                'ordem' => $m->ordem,
                'aulas' => $aulasPublicadas->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'titulo' => $a->titulo,
                        'ordem' => $a->ordem,
                        'conteudos' => $a->conteudos->map(fn ($c) => [
                            'id' => $c->id,
                            'tipo' => $c->tipo,
                            'ordem' => $c->ordem,
                            'video_yt_id' => $c->video_yt_id,
                            'texto' => $c->texto,
                            'link_url' => $c->link_url,
                            'arquivo_path' => $c->arquivo_path ?? null,
                            'arquivo_nome' => $c->arquivo_nome ?? null,
                            'arquivo_mime' => $c->arquivo_mime ?? null,
                            'arquivo_size' => $c->arquivo_size ?? null,
                        ])->values(),
                    ];
                })->values(),
            ];
        })->values();

        // flat pra navegação/bloqueio
        $flat = collect();
        foreach ($modulos as $m) {
            foreach ($m['aulas'] as $a) {
                $flat->push($a);
            }
        }

        $requestedAulaId = $request->query('aula');
        $aulaAtual = $requestedAulaId
            ? $flat->firstWhere('id', (int)$requestedAulaId)
            : ($flat->first() ?? null);

        $concluidasIds = AulasConcluidas::where('inscrito_id', $inscricao->id)
            ->pluck('aula_id')
            ->values();

        $unlockedIndex = 0;
        for ($i = 0; $i < $flat->count(); $i++) {
            if ($i === 0 || $concluidasIds->contains($flat[$i - 1]['id'])) {
                $unlockedIndex = $i;
            } else {
                break;
            }
        }

        // se tentou acessar bloqueada, manda pra última liberada
        if ($aulaAtual) {
            $idxAtual = $flat->search(fn ($a) => $a['id'] === $aulaAtual['id']);
            if ($idxAtual !== false && $idxAtual > $unlockedIndex) {
                $aulaAtual = $flat[$unlockedIndex] ?? $flat->first();
            }
        }

        return Inertia::render('participante/curso-player-oficial', [
            'evento' => ['id' => $evento->id, 'nome' => $evento->nome],
            'curso' => ['id' => $curso->id, 'nome' => $curso->nome, 'descricao' => $curso->descricao],
            'aulaAtualId' => $aulaAtual['id'] ?? null,
            'concluidasIds' => $concluidasIds,
            'modulos' => $modulos,
            'unlockedIndex' => $unlockedIndex,
        ]);
    }

    public function concluir(Request $request, Aula $aula)
    {
        $participante = Auth::guard('participante')->user();

        $aula->load('modulo.curso');

        abort_unless((bool) $aula->publicada, 404);

        $eventoId = $aula->modulo->curso->evento_id;
        $cursoId  = $aula->modulo->curso->id;

        $inscricao = EventoParticipante::where('evento_id', $eventoId)
            ->where('participante_id', $participante->id)
            ->firstOrFail();

        $aulasOrdenadas = Aula::query()
            ->select('aulas.id')
            ->join('modulos', 'modulos.id', '=', 'aulas.modulo_id')
            ->where('modulos.curso_id', $cursoId)
            ->where('aulas.publicada', true)
            ->orderBy('modulos.ordem')
            ->orderBy('aulas.ordem')
            ->pluck('aulas.id')
            ->values();

        $idx = $aulasOrdenadas->search(fn ($id) => (int)$id === (int)$aula->id);
        abort_unless($idx !== false, 404);

        if ($idx > 0) {
            $prevId = (int)$aulasOrdenadas[$idx - 1];
            $temAnterior = AulasConcluidas::where('inscrito_id', $inscricao->id)
                ->where('aula_id', $prevId)
                ->exists();
            abort_unless($temAnterior, 403);
        }

        AulasConcluidas::updateOrCreate(
            ['inscrito_id' => $inscricao->id, 'aula_id' => $aula->id],
            ['concluido_em' => now()]
        );

        return back()->with('success', 'Aula concluída!');
    }

    public function desconcluir(Request $request, Aula $aula)
    {
        $participante = Auth::guard('participante')->user();

        $aula->load('modulo.curso');

        $eventoId = $aula->modulo->curso->evento_id;
        $cursoId  = $aula->modulo->curso->id;

        $inscricao = EventoParticipante::where('evento_id', $eventoId)
            ->where('participante_id', $participante->id)
            ->firstOrFail();

        $aulasOrdenadas = Aula::query()
            ->select('aulas.id')
            ->join('modulos', 'modulos.id', '=', 'aulas.modulo_id')
            ->where('modulos.curso_id', $cursoId)
            ->where('aulas.publicada', true)
            ->orderBy('modulos.ordem')
            ->orderBy('aulas.ordem')
            ->pluck('aulas.id')
            ->values();

        $idx = $aulasOrdenadas->search(fn ($id) => (int)$id === (int)$aula->id);
        abort_unless($idx !== false, 404);

        $idsParaRemover = $aulasOrdenadas->slice($idx)->values();

        AulasConcluidas::where('inscrito_id', $inscricao->id)
            ->whereIn('aula_id', $idsParaRemover)
            ->delete();

        return back()->with('success', 'Progresso resetado.');
    }
}
