<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Participante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;
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
            $validator = Validator::make($request->all(), [
                'nome' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'cpf' => 'required|string|min:14|max:255',
                'telefone' => 'required|string|max:20',
                'categoria_profissional' => 'required|string|max:255',
                'numero_inscricao' => 'nullable|digits_between:1,20',
                'municipio' => 'required|string',
                'instituicao' => 'nullable|string|max:255',
                'evento_id' => 'required|exists:eventos,id'
            ], [
                'nome.required' => 'O campo nome é obrigatório.',
                'email.required' => 'O campo email é obrigatório.',
                'cpf.required' => 'O campo CPF é obrigatório.',
                'instituicao.required' => 'O campo instituição é obrigatório.',
                'municipio.required' => 'Não foi possível pegar a sua localização.',
                'numero_inscricao.required' => 'O campo número de inscrição é obrigatório.',
                'numero_inscricao.digits_between' => 'O número da inscrição deve ter entre 1 e 20 dígitos.',
                'evento_id.exists' => 'O evento informado não existe.',
            ]);

            // Lógica condicional para tornar 'numero_inscricao' e 'instituicao' obrigatórios
            $validator->sometimes('numero_inscricao', 'required|digits_between:1,20', function ($input) {
                return !in_array($input->categoria_profissional, ['Estudante', 'Outros']);
            });

            $validator->sometimes('instituicao', 'required|string|max:255', function ($input) {
                return !in_array($input->categoria_profissional, ['Estudante', 'Outros']);
            });

            // Verificando falhas na validação
            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator)->withInput();
            }

            // Salvar ou atualizar o participante
            $validated = $validator->validated();

            $participante = Participante::updateOrCreate(
                ['cpf' => $validated['cpf']],
                $validated
            );

            // Sincronizando o participante com o evento
            $evento = Evento::findOrFail($validated['evento_id']);
            $evento->participantes()->syncWithoutDetaching([
                $participante->id => ['status' => 'inscrito']
            ]);

            return redirect()->route('cadastroRealizado', ['id' => $participante->id]);
        } catch (ValidationException $exception) {
            return Redirect::back()
                ->withErrors($exception->errors())
                ->withInput();
        }
    }

    public function confirmarPresenca(Request $request, $id)
    {
        try {

            $validated = $request->validate([
                'cpf' => 'required|string|min:14|max:255',
            ], [
                'cpf.required' => 'O campo CPF é obrigatório.',
            ]);

            $cpf = $validated['cpf'];
            $evento = Evento::findOrFail($id);

            $participante = Participante::where('cpf', $cpf)->first();

            if (!$participante) {
                return back()->withErrors(['cpf' => 'Participante não encontrado.']);
            }

            $inscrito = DB::table('evento_participante')
                ->where('evento_id', $evento->id)
                ->where('participante_id', $participante->id)
                ->first();

            if (!$inscrito) {
                return back()->withErrors(['cpf' => 'Você não está inscrito neste evento.']);
            }

            DB::table('evento_participante')
                ->where('evento_id', $evento->id)
                ->where('participante_id', $participante->id)
                ->update(['status' => 'confirmado']);

            return redirect()->route('cadastroRealizado', ['id' => $participante->id]);

        } catch (ValidationException $exception) {
            return Redirect::back()
                ->withErrors($exception->errors())
                ->withInput();
        }

    }
}
