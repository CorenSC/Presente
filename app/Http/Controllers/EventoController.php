<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EventoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function list()
    {
        //
    }

    public function store(Request $request)
    {
        try {
            dump( now()->startOfDay());
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'local' => 'required|string|max:255',
                'dataInicio' => 'required|date|after:' . now()->startOfDay(),
                'dataFim' => 'required|date|after_or_equal:dataInicio',
                'horaInicio' => 'required',
                'horaFim' => 'required',
            ], [
                'dataInicio.after' => 'A data de início não pode ser anterior a hoje.',
                'dataFim.after_or_equal' => 'A data de fim não pode ser anterior a data de início.',
            ]);

            Evento::create($validated);
            return response()->json(['message' => 'Evento criado com sucesso!'], 200);
        } catch (ValidationException $exception) {
            return Inertia::render('events/criar-evento', [
                'message' => $exception->getMessage(),
                'errors' => $exception->errors()
            ]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Evento $evento)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Evento $evento)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evento $evento)
    {
        //
    }
}
