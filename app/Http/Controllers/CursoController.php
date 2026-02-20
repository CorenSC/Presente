<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Illuminate\Http\Request;

class CursoController extends Controller
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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Curso $curso)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Curso $curso)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Curso $curso)
    {
        $validated = $request->validate(
            [
                'nome' => ['required', 'string', 'max:255'],
                'descricao' => ['nullable', 'string'],
                'carga_horaria' => ['nullable', 'integer', 'min:1', 'max:10000'],
            ],
            [
                'nome.required' => 'O nome do curso é obrigatório.',
                'nome.max' => 'O nome do curso pode ter no máximo 255 caracteres.',
                'descricao.string' => 'A descrição deve ser um texto válido.',
                'carga_horaria.integer' => 'A carga horária deve ser um número inteiro.',
                'carga_horaria.min' => 'A carga horária deve ser maior que zero.',
            ]
        );

        $curso->update([
            'nome' => $validated['nome'],
            'descricao' => $validated['descricao'] ?? null,
            'carga_horaria' => $validated['carga_horaria'] ?? null,
        ]);

        return redirect()
            ->route('gerenciarCurso', ['evento' => $curso->evento_id])
            ->with('success', 'Curso atualizado com sucesso!');

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Curso $curso)
    {
        //
    }
}
