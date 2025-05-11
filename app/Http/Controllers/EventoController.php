<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Carbon\Carbon;
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
        return Inertia::render('events/lista-evento', [
            'eventos' => Evento::all()
        ]);
    }

    public function store(Request $request)
    {
        try {

            $dataInicio = Carbon::createFromFormat('d/m/Y', $request->input('data_inicio'))->format('Y-m-d');
            $dataFim = Carbon::createFromFormat('d/m/Y', $request->input('data_fim'))->format('Y-m-d');
            $request->merge(['data_inicio' => $dataInicio, 'data_fim' => $dataFim]);

            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'required|string|min:10',
                'local_do_evento' => 'required|string|max:255',
                'data_inicio' => 'required|date|after_or_equal:' . now()->format('Y-m-d'),
                'data_fim' => 'required|date|after_or_equal:data_inicio',
                'hora_inicio' => 'required',
                'hora_fim' => 'required|date_format:H:i|after:hora_inicio',
                'atividades.*.data' => 'required|date|after_or_equal:' . $dataInicio . '|before_or_equal:' . $dataFim,
                'atividades.*.hora_fim' => 'required|date_format:H:i|after:atividades.*.hora_inicio',
                'atividades.*.hora_inicio' => 'required',
                'atividades.*.nome' => 'required|string|max:255',
            ], [
                'descricao.min' => 'A descrição deve conter no minimo 10 caracteres.',
                'data_inicio.after_or_equal' => 'A data de início não pode ser anterior a hoje.',
                'data_fim.after_or_equal' => 'A data fim não pode ser anterior a data de início.',
                'hora_fim.after' => 'A hora fim não pode ser anterior ou igual a hora de início',
                'atividades.*.data.required' => 'A data da atividade é obrigatória.',
                'atividades.*.hora_fim.required' => 'A hora fim da atividade é obrigatória.',
                'atividades.*.hora_inicio.required' => 'A hora início da atividade é obrigatória.',
                'atividades.*.data.after_or_equal' => 'O horário de início não pode ser antes da data inicial do evento.',
                'atividades.*.data.before_or_equal' => 'O horário de início não pode ser depois da data final do evento.',
                'atividades.*.hora_fim.after' => 'A hora fim da ativade não pode ser anterior ou igual a hora de início.',
                'atividades.*.nome.required' => 'O nome da atividade é obrigatório.',
                'atividades.*.nome.max' => 'O nome da atividade não pode conter mais de 255 caracteres.'
            ]);
            $evento = Evento::create($validated);
            foreach ($request->input('atividades', []) as $atividadeData) {
                $evento->atividades()->create($atividadeData);
            }
            return redirect()
                ->route('eventoShow', ['id' => $evento->id])
                ->with('success', 'Evento cadastrado com sucesso.')
            ;

        } catch (ValidationException $exception) {
            return Inertia::render('events/criar-evento', [
                'message' => $exception->getMessage(),
                'errors' => $exception->errors()
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Evento $evento)
    {
        try {

            $dataInicio = Carbon::createFromFormat('d/m/Y', $request->input('data_inicio'))->format('Y-m-d');
            $dataFim = Carbon::createFromFormat('d/m/Y', $request->input('data_fim'))->format('Y-m-d');
            $request->merge(['data_inicio' => $dataInicio, 'data_fim' => $dataFim]);

            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'local_do_evento' => 'required|string|max:255',
                'data_fim' => 'required|date|after_or_equal:data_inicio',
                'hora_inicio' => 'required',
                'hora_fim' => 'required|date_format:H:i|after:hora_inicio',
                'atividades.*.data' => 'required|date|after_or_equal:' . $dataInicio . '|before_or_equal:' . $dataFim,
                'atividades.*.hora_fim' => 'required|date_format:H:i|after:atividades.*.hora_inicio',
                'atividades.*.hora_inicio' => 'required',
                'atividades.*.nome' => 'required|string|max:255',
            ], [
                'data_fim.after_or_equal' => 'A data fim não pode ser anterior a data de início.',
                'hora_fim.after' => 'A hora fim não pode ser anterior ou igual a hora de início.',
                'atividades.*.data.required' => 'A data da atividade é obrigatória.',
                'atividades.*.hora_fim.required' => 'A hora fim da atividade é obrigatória.',
                'atividades.*.hora_inicio.required' => 'A hora início da atividade é obrigatória.',
                'atividades.*.data.after_or_equal' => 'O horário de início não pode ser antes da data inicial do evento.',
                'atividades.*.data.before_or_equal' => 'O horário de início não pode ser depois da data final do evento.',
                'atividades.*.hora_fim.after' => 'A hora fim da ativade não pode ser anterior ou igual a hora de início.',
                'atividades.*.nome.required' => 'O nome da atividade é obrigatório.',
                'atividades.*.nome.max' => 'O nome da atividade não pode conter mais de 255 caracteres.'
            ]);
            $evento->update($validated);

            if ($request->has('atividades')) {
                $atividadesIds = [];

                foreach ($request->input('atividades') as $atividadeData) {
                    if (isset($atividadeData['id'])) {
                        $atividade = $evento->atividades()->find($atividadeData['id']);
                        if ($atividade) {
                            $atividade->update($atividadeData);
                            $atividadesIds[] = $atividade->id;
                        }
                    } else {
                        $novaAtividade = $evento->atividades()->create($atividadeData);
                        $atividadesIds[] = $novaAtividade->id;
                    }
                }

                $evento->atividades()->whereNotIn('id', $atividadesIds)->delete();
            } else {
                $evento->atividades()->delete();
            }

            return redirect()
                ->route('eventoShow', ['id' => $evento->id])
                ->with('success', 'Evento atualizado com sucesso.')
            ;

        } catch (ValidationException $exception) {
            return Inertia::render('events/editar-evento', [
                'evento' => $evento,
                'message' => $exception->getMessage(),
                'errors' => $exception->errors()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evento $evento)
    {
        $evento->ativo = false;
        $evento->save();
        return redirect()->route('listarEventos')->with('success', 'Evento inativado com sucesso.');
    }

    public function createLinkForSignUp($id)
    {
        $evento = Evento::findOrFail($id);
        $evento->link_liberado = true;
        $evento->save();
        return redirect()
            ->route('eventoShow', ['id' => $evento->id])
            ->with('success', 'Link para cadastro no evento ativado com sucesso.')
        ;
    }

    public function createQrCode(Evento $evento)
    {
        $evento->linkLiberado = true;
        $evento->save();
        return redirect()
            ->route('eventoShow', ['id' => $evento->id])
            ->with('success', 'QrCode para confirmar participação no evento gerado com sucesso.')
        ;
    }
}
