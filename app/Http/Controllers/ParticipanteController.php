<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Participante;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ParticipanteController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'cpf' => 'required|string|min:14|max:255',
                'telefone' => 'required|string|max:20',
                'categoria_profissional' => 'required|string|max:255',
                'numero_inscricao' => 'required|digits_between:1,10',
            ]);

            $participante = Participante::where('cpf', $validated['cpf'])->first();

            if ($participante) {
                $dadosDiferentes = array_filter([
                    'nome' => $validated['nome'] !== $participante->nome,
                    'email' => $validated['email'] !== $participante->email,
                    'telefone' => $validated['telefone'] !== $participante->telefone,
                    'categoria_profissional' => $validated['categoria_profissional'] !== $participante->categoria_profissional,
                    'numero_inscricao' => $validated['numero_inscricao'] !== $participante->numero_inscricao,
                ]);

                if (!empty($dadosDiferentes)) {
                    $participante->update($validated);
                }
            } else {
                $participante = Participante::create($validated);
            }

            // Relacionar com evento na tabela pivô
            $evento = Evento::findOrFail($validated['evento_id']);
            $evento->participantes()->syncWithoutDetaching([
                $participante->id => ['status' => 'inscrito']
            ]);

            return Inertia::render('cadastro-realizado', [
                'participante' => $participante
            ]);
        } catch (ValidationException $exception) {
            return Inertia::render('events/evento-form-cadastro', [
                'message' => $exception->getMessage(),
                'errors' => $exception->errors()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Participante $participante)
    {
        //
    }
}
