<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Modulo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModuloController extends Controller
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

    public function store(Request $request, Curso $curso)
    {
        $validated = $request->validate(
            [
                'nome' => ['required', 'string', 'max:255'],
                'descricao' => ['nullable', 'string'],
                'data_inicio' => ['nullable', 'date'],
                'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
                'tem_prova' => ['boolean'],
            ],
            [
                // NOME
                'nome.required' => 'O nome do módulo é obrigatório.',
                'nome.string'   => 'O nome do módulo deve ser um texto válido.',
                'nome.max'      => 'O nome do módulo pode ter no máximo 255 caracteres.',

                // DESCRIÇÃO
                'descricao.string' => 'A descrição do módulo deve ser um texto válido.',

                // DATA INÍCIO
                'data_inicio.date' => 'A data de início deve ser uma data válida.',

                // DATA FIM
                'data_fim.date' => 'A data de fim deve ser uma data válida.',
                'data_fim.after_or_equal' =>
                    'A data de fim não pode ser anterior à data de início.',

                // PROVA
                'tem_prova.boolean' =>
                    'O campo "possui prova" deve ser verdadeiro ou falso.',
            ]
        );

        // Próxima ordem automática
        $ordem = Modulo::where('curso_id', $curso->id)->max('ordem') ?? 0;

        Modulo::create([
            'curso_id'    => $curso->id,
            'nome'        => $validated['nome'],
            'descricao'   => $validated['descricao'] ?? null,
            'data_inicio' => $validated['data_inicio'] ?? null,
            'data_fim'    => $validated['data_fim'] ?? null,
            'tem_prova'   => $validated['tem_prova'] ?? false,
            'ordem'       => $ordem + 1,
        ]);

        return redirect()
            ->route('gerenciarCurso', ['evento' => $curso->evento_id])
            ->with('success', 'Módulo criado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Modulo $modulo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Modulo $modulo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Modulo $modulo)
    {
        $validated = $request->validate(
            [
                'nome' => ['required', 'string', 'max:255'],
                'descricao' => ['nullable', 'string'],
                'data_inicio' => ['nullable', 'date'],
                'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
                'tem_prova' => ['boolean'],
            ],
            [
                'nome.required' => 'O nome do módulo é obrigatório.',
                'nome.max' => 'O nome do módulo pode ter no máximo 255 caracteres.',
                'descricao.string' => 'A descrição deve ser um texto válido.',
                'data_inicio.date' => 'A data de início deve ser uma data válida.',
                'data_fim.date' => 'A data de fim deve ser uma data válida.',
                'data_fim.after_or_equal' => 'A data de fim não pode ser anterior à data de início.',
                'tem_prova.boolean' => 'O campo "possui prova" deve ser verdadeiro ou falso.',
            ]
        );

        $modulo->update([
            'nome' => $validated['nome'],
            'descricao' => $validated['descricao'] ?? null,
            'data_inicio' => $validated['data_inicio'] ?? null,
            'data_fim' => $validated['data_fim'] ?? null,
            'tem_prova' => $validated['tem_prova'] ?? false,
        ]);

        return redirect()
            ->route('gerenciarCurso', ['evento' => $modulo->curso->evento_id])
            ->with('success', 'Módulo atualizado com sucesso!');

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Modulo $modulo)
    {
        //
    }

    public function reordenar(Request $request, Curso $curso)
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ])['ids'];

        // remove duplicados e normaliza
        $ids = array_values(array_unique(array_map('intval', $ids)));

        // ✅ garante que TODOS os ids enviados pertencem ao curso
        $countValidos = Modulo::where('curso_id', $curso->id)
            ->whereIn('id', $ids)
            ->count();

        abort_unless($countValidos === count($ids), 422);

        DB::transaction(function () use ($ids) {
            foreach ($ids as $i => $id) {
                Modulo::where('id', $id)->update(['ordem' => $i + 1]);
            }
        });

        return back()->with('success', 'Ordem dos módulos atualizada!');
    }

}
