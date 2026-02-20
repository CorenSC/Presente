<?php

namespace App\Http\Controllers;

use App\Models\Aula;
use App\Models\Modulo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Modulo $modulo)
    {
        $validated = $request->validate(
            [
                'titulo' => ['required', 'string', 'max:255'],
                'descricao' => ['nullable', 'string'],
                'publicada' => ['nullable', 'boolean'],
            ],
            [
                'titulo.required' => 'Informe o título da aula.',
                'titulo.max' => 'O título da aula pode ter no máximo 255 caracteres.',
                'descricao.string' => 'A descrição deve ser um texto válido.',
                'publicada.boolean' => 'O campo "Publicada" deve ser Sim ou Não.',
            ]
        );

        $ordem = Aula::where('modulo_id', $modulo->id)->max('ordem') ?? 0;

        $aula = Aula::create([
            'modulo_id' => $modulo->id,
            'titulo' => $validated['titulo'],
            'descricao' => $validated['descricao'] ?? null,
            'ordem' => $ordem + 1,
            'publicada' => $request->boolean('publicada'), // ✅
        ]);

        // ✅ MGC: joga para gerenciar conteúdos da aula
        return redirect()
            ->route('conteudosGerenciar', ['aula' => $aula->id])
            ->with('success', 'Aula criada! Agora adicione o conteúdo.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Aula $aula)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Aula $aula)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Aula $aula)
    {
        $validated = $request->validate(
            [
                'titulo' => ['required', 'string', 'max:255'],
                'descricao' => ['nullable', 'string'],
                'publicada' => ['nullable', 'boolean'],
            ],
            [
                'titulo.required' => 'O título da aula é obrigatório.',
                'titulo.max' => 'O título da aula pode ter no máximo 255 caracteres.',
                'descricao.string' => 'A descrição deve ser um texto válido.',
                'publicada.boolean' => 'O campo "Publicada" deve ser Sim ou Não.',
            ]
        );

        $aula->update([
            'titulo' => $validated['titulo'],
            'descricao' => $validated['descricao'] ?? null,
            'publicada' => $request->boolean('publicada'), // ✅
        ]);

        $aula->load('modulo.curso:id,evento_id');

        return redirect()
            ->route('gerenciarCurso', ['evento' => $aula->modulo->curso->evento_id])
            ->with('success', 'Aula atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Aula $aula)
    {
        //
    }

    public function reordenar(Request $request, Modulo $modulo)
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ])['ids'];

        // normaliza + remove duplicados
        $ids = array_values(array_unique(array_map('intval', $ids)));

        // ✅ garante que TODOS os ids enviados pertencem ao módulo
        $countValidos = Aula::where('modulo_id', $modulo->id)
            ->whereIn('id', $ids)
            ->count();

        abort_unless($countValidos === count($ids), 422);

        DB::transaction(function () use ($ids) {
            foreach ($ids as $i => $id) {
                Aula::where('id', $id)->update(['ordem' => $i + 1]);
            }
        });

        return back()->with('success', 'Ordem das aulas atualizada!');
    }

}
