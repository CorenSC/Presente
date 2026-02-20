<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Aula;
use App\Models\AulasConcluidas;
use App\Models\EventoParticipante;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CursoPlayerController extends Controller
{
    public function show(Request $request, Evento $evento)
    {
        $userId = auth()->id();

        // ✅ curso precisa existir para abrir preview
        $curso = $evento->curso()->firstOrFail();

        $curso->load([
            'modulos' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aula' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aula.conteudos' => fn ($q) => $q->orderBy('ordem'),
        ]);

        // ✅ tenta pegar inscrição (mas não quebra preview)
        $inscricao = null;
        if ($userId) {
            $inscricao = EventoParticipante::where('evento_id', $evento->id)
                ->where('participante_id', $userId)
                ->first(); // 👈 sem firstOrFail
        }

        // 🔒 Só aulas publicadas no player
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

        // lista flat para navegação/bloqueio
        $flat = collect();
        foreach ($modulos as $m) {
            foreach ($m['aulas'] as $a) {
                $flat->push($a);
            }
        }

        $requestedAulaId = $request->query('aula');

        $aulaAtual = $requestedAulaId
            ? $flat->firstWhere('id', (int) $requestedAulaId)
            : ($flat->first() ?? null);

        // ✅ aulas concluídas: só se tiver inscrição
        $concluidasIds = collect();
        if ($inscricao) {
            $concluidasIds = AulasConcluidas::where('inscrito_id', $inscricao->id)
                ->pluck('aula_id')
                ->values();
        }

        // 🔒 bloqueio: no preview libera tudo
        if (!$inscricao) {
            $unlockedIndex = max(0, $flat->count() - 1);
        } else {
            $unlockedIndex = 0;

            for ($i = 0; $i < $flat->count(); $i++) {
                if ($i === 0 || $concluidasIds->contains($flat[$i - 1]['id'])) {
                    $unlockedIndex = $i;
                } else {
                    break;
                }
            }

            // Se pediram uma aula bloqueada, manda pra última liberada
            if ($aulaAtual) {
                $idxAtual = $flat->search(fn ($a) => $a['id'] === $aulaAtual['id']);

                if ($idxAtual !== false && $idxAtual > $unlockedIndex) {
                    $aulaAtual = $flat[$unlockedIndex] ?? $flat->first();
                }
            }
        }

        return inertia('curso/playerCurso', [
            'evento' => [
                'id' => $evento->id,
                'nome' => $evento->nome ?? null,
            ],
            'curso' => [
                'id' => $curso->id,
                'nome' => $curso->nome,
                'descricao' => $curso->descricao,
                'evento_id' => $curso->evento_id, // útil pro front
            ],
            'aulaAtualId' => $aulaAtual['id'] ?? null,
            'concluidasIds' => $concluidasIds,
            'modulos' => $modulos,
            'unlockedIndex' => $unlockedIndex,
            'isPreview' => !$inscricao, // 👈 opcional pro front mostrar badge “Preview”
        ]);
    }


    public function concluir(Request $request, Aula $aula)
    {
        $userId = auth()->id();
        abort_unless($userId, 401);

        $aula->load('modulo.curso');

        // 🔒 Não permitir concluir aula não publicada
        abort_unless((bool) $aula->publicada, 404);

        $cursoId = $aula->modulo->curso->id;
        $eventoId = $aula->modulo->curso->evento_id;

        $inscricao = EventoParticipante::where('evento_id', $eventoId)
            ->where('participante_id', $userId)
            ->firstOrFail();

        // ✅ Lista ordenada (flat) de aulas publicadas do curso
        $aulasOrdenadas = Aula::query()
            ->select('aulas.id')
            ->join('modulos', 'modulos.id', '=', 'aulas.modulo_id')
            ->where('modulos.curso_id', $cursoId)
            ->where('aulas.publicada', true)
            ->orderBy('modulos.ordem')
            ->orderBy('aulas.ordem')
            ->pluck('aulas.id')
            ->values();

        $idx = $aulasOrdenadas->search(fn ($id) => (int) $id === (int) $aula->id);
        abort_unless($idx !== false, 404);

        // 🔒 Regra: só conclui se a anterior estiver concluída (exceto primeira)
        if ($idx > 0) {
            $prevId = (int) $aulasOrdenadas[$idx - 1];

            $temAnteriorConcluida = AulasConcluidas::where('inscrito_id', $inscricao->id)
                ->where('aula_id', $prevId)
                ->exists();

            abort_unless($temAnteriorConcluida, 403);
        }

        AulasConcluidas::updateOrCreate(
            ['inscrito_id' => $inscricao->id, 'aula_id' => $aula->id],
            ['concluido_em' => now()]
        );

        return back()->with('success', 'Aula concluída!');
    }

    public function desconcluir(Request $request, Aula $aula)
    {
        $userId = auth()->id();
        abort_unless($userId, 401);

        $aula->load('modulo.curso');

        $cursoId = $aula->modulo->curso->id;
        $eventoId = $aula->modulo->curso->evento_id;

        $inscricao = EventoParticipante::where('evento_id', $eventoId)
            ->where('participante_id', $userId)
            ->firstOrFail();

        // ✅ Lista ordenada (flat) de aulas publicadas do curso
        $aulasOrdenadas = Aula::query()
            ->select('aulas.id')
            ->join('modulos', 'modulos.id', '=', 'aulas.modulo_id')
            ->where('modulos.curso_id', $cursoId)
            ->where('aulas.publicada', true)
            ->orderBy('modulos.ordem')
            ->orderBy('aulas.ordem')
            ->pluck('aulas.id')
            ->values();

        $idx = $aulasOrdenadas->search(fn ($id) => (int) $id === (int) $aula->id);
        abort_unless($idx !== false, 404);

        // 🧠 (2) Desconcluir coerente: reseta esta e TODAS as próximas
        $idsParaRemover = $aulasOrdenadas->slice($idx)->values();

        AulasConcluidas::where('inscrito_id', $inscricao->id)
            ->whereIn('aula_id', $idsParaRemover)
            ->delete();

        return back()->with('success', 'Conclusão removida (e progresso posterior resetado).');
    }

}
