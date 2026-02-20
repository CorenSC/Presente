<?php

use App\Http\Controllers\AulaController;
use App\Http\Controllers\ConteudoController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\CursoPlayerController;
use App\Http\Controllers\ModuloController;
use App\Models\Aula;
use App\Models\Conteudo;
use App\Models\Curso;
use App\Models\Evento;
use App\Models\Modulo;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('gerenciar/curso/{evento}', function (Evento $evento) {
        $curso = $evento->curso()->firstOrFail();
        return Inertia::render('curso/gerenciarCurso', [
            'curso' => $curso->load([
                'modulos' => fn ($q) => $q->orderBy('ordem'),
                'modulos.aula' => fn ($q) => $q->orderBy('ordem'),
                'modulos.prova',
            ]),
            'flash' => [
                'success' => Session::get('success'),
            ],
        ]);
    })->name('gerenciarCurso');

    Route::get('gerenciar/curso/{curso}/editar', function (Curso $curso) {
        return Inertia::render('curso/editarCurso', [
            'curso' => [
                'id' => $curso->id,
                'evento_id' => $curso->evento_id,
                'nome' => $curso->nome,
                'descricao' => $curso->descricao,
                'carga_horaria' => $curso->carga_horaria
            ],
        ]);
    })->name('cursoEditar');

    Route::put('gerenciar/cursos/{curso}', [CursoController::class, 'update'])
    ->name('cursoUpdate');


    // Modulos
    Route::get('curso/{curso}/modulos/criar', function (\App\Models\Curso $curso) {
        return Inertia::render('modulos/adicionarModulo', [
            'curso' => [
                'id' => $curso->id,
                'nome' => $curso->nome,
                'evento_id' => $curso->evento_id, // útil pra voltar
            ],
        ]);
    })->name('criarModulo');

    Route::post('curso/{curso}/modulos', [ModuloController::class, 'store'])
    ->name('moduloStore');

    Route::get('modulos/{modulo}/editar', function (Modulo $modulo) {
        $modulo->load('curso:id,nome,evento_id');

        return Inertia::render('modulos/editarModulo', [
            'modulo' => [
                'id' => $modulo->id,
                'curso_id' => $modulo->curso_id,
                'nome' => $modulo->nome,
                'descricao' => $modulo->descricao,
                'data_inicio' => optional($modulo->data_inicio)->format('Y-m-d'),
                'data_fim' => optional($modulo->data_fim)->format('Y-m-d'),
                'tem_prova' => (bool) $modulo->tem_prova,
                'ordem' => $modulo->ordem,
            ],
            'curso' => [
                'id' => $modulo->curso->id,
                'nome' => $modulo->curso->nome,
                'evento_id' => $modulo->curso->evento_id,
            ],
        ]);
    })->name('moduloEditar');

    Route::put('modulos/{modulo}', [ModuloController::class, 'update'])
        ->name('moduloUpdate');

    //Aula

    Route::get('modulos/{modulo}/aulas/criar', function (Modulo $modulo) {
        $modulo->load('curso:id,evento_id,nome');

        return Inertia::render('aulas/adicionarAula', [
            'modulo' => [
                'id' => $modulo->id,
                'nome' => $modulo->nome,
                'curso_id' => $modulo->curso_id,
            ],
            'curso' => [
                'id' => $modulo->curso->id,
                'nome' => $modulo->curso->nome,
                'evento_id' => $modulo->curso->evento_id,
            ],
        ]);
    })->name('aulaCriar');

    Route::post('modulos/{modulo}/aulas', [AulaController::class, 'store'])
        ->name('aulaStore');

    Route::get('aulas/{aula}/editar', function (Aula $aula) {
        $aula->load('modulo.curso:id,evento_id,nome');

        return Inertia::render('aulas/editarAula', [
            'aula' => [
                'id' => $aula->id,
                'modulo_id' => $aula->modulo_id,
                'titulo' => $aula->titulo,
                'descricao' => $aula->descricao,
                'ordem' => $aula->ordem,
            ],
            'modulo' => [
                'id' => $aula->modulo->id,
                'nome' => $aula->modulo->nome,
            ],
            'curso' => [
                'id' => $aula->modulo->curso->id,
                'nome' => $aula->modulo->curso->nome,
                'evento_id' => $aula->modulo->curso->evento_id,
            ],
        ]);
    })->name('aulaEditar');

    Route::put('aulas/{aula}', [AulaController::class, 'update'])
        ->name('aulaUpdate');

        /*
    |--------------------------------------------------------------------------
    | CONTEÚDOS DA AULA
    |--------------------------------------------------------------------------
    */
    Route::get('aulas/{aula}/conteudos', function (Aula $aula) {
        $aula->load([
            'modulo.curso:id,evento_id,nome',
            'conteudos' => fn ($q) => $q->orderBy('ordem'),
        ]);

        return Inertia::render('conteudo/gerenciarConteudo', [
            'aula' => [
                'id' => $aula->id,
                'titulo' => $aula->titulo,
                'ordem' => $aula->ordem,
            ],
            'modulo' => [
                'id' => $aula->modulo->id,
                'nome' => $aula->modulo->nome,
            ],
            'curso' => [
                'id' => $aula->modulo->curso->id,
                'nome' => $aula->modulo->curso->nome,
                'evento_id' => $aula->modulo->curso->evento_id,
            ],
            'conteudos' => $aula->conteudos,
            'flash' => [
                'success' => Session::get('success'),
            ],
        ]);
    })->name('conteudosGerenciar');

    Route::get('aulas/{aula}/conteudos/criar', function (Aula $aula) {
        $aula->load('modulo.curso:id,evento_id,nome');

        return Inertia::render('conteudo/criarConteudo', [
            'aula' => ['id' => $aula->id, 'titulo' => $aula->titulo, 'ordem' => $aula->ordem],
            'modulo' => ['id' => $aula->modulo->id, 'nome' => $aula->modulo->nome],
            'curso' => [
                'id' => $aula->modulo->curso->id,
                'nome' => $aula->modulo->curso->nome,
                'evento_id' => $aula->modulo->curso->evento_id,
            ],
        ]);
    })->name('conteudoCriar');


    Route::post('aulas/{aula}/conteudos', [ConteudoController::class, 'store'])
        ->name('conteudoStore');

    Route::get('conteudos/{conteudo}/editar', function (Conteudo $conteudo) {
        $conteudo->load('aula.modulo.curso:id,evento_id,nome');

        return Inertia::render('conteudo/editarConteudo', [
            'conteudo' => [
                'id' => $conteudo->id,
                'aula_id' => $conteudo->aula_id,
                'tipo' => $conteudo->tipo,
                'video_yt_id' => $conteudo->video_yt_id,
                'texto' => $conteudo->texto,
                'link_url' => $conteudo->link_url,
                'arquivo_path' => $conteudo->arquivo_path,
                'arquivo_nome' => $conteudo->arquivo_nome,
                'arquivo_mime' => $conteudo->arquivo_mime,
                'arquivo_size' => $conteudo->arquivo_size,
                'ordem' => $conteudo->ordem,
            ],
            'aula' => [
                'id' => $conteudo->aula->id,
                'titulo' => $conteudo->aula->titulo,
                'ordem' => $conteudo->aula->ordem,
            ],
            'modulo' => [
                'id' => $conteudo->aula->modulo->id,
                'nome' => $conteudo->aula->modulo->nome,
            ],
            'curso' => [
                'id' => $conteudo->aula->modulo->curso->id,
                'nome' => $conteudo->aula->modulo->curso->nome,
                'evento_id' => $conteudo->aula->modulo->curso->evento_id,
            ],
        ]);
    })->name('conteudoEditar');

    Route::put('conteudos/{conteudo}', [ConteudoController::class, 'update'])
        ->name('conteudoUpdate');

    Route::delete('conteudos/{conteudo}', [ConteudoController::class, 'destroy'])
        ->name('conteudoDestroy');




    Route::get('curso/{evento}/player', [CursoPlayerController::class, 'show'])
        ->name('cursoPlayer');

    Route::post('aulas/{aula}/concluir', [CursoPlayerController::class, 'concluir'])
        ->name('aulaConcluir');

    Route::delete('aulas/{aula}/concluir', [CursoPlayerController::class, 'desconcluir'])
        ->name('aulaDesconcluir');


    Route::post('curso/{curso}/modulos/reordenar', [ModuloController::class, 'reordenar'])
        ->name('modulosReordenar');

    Route::post('modulos/{modulo}/aulas/reordenar', [AulaController::class, 'reordenar'])
        ->name('aulasReordenar');
});
