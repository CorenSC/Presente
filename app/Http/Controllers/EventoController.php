<?php

namespace App\Http\Controllers;

use App\Exports\ParticipantesExport;
use App\Imports\ParticipantesImport;
use App\Models\CertificadoModelo;
use App\Models\Curso;
use App\Models\Evento;
use Carbon\Carbon;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException as ExcelValidationException;
use Illuminate\Support\Str;

class EventoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function list()
    {
        return Inertia::render('events/lista-evento', [
            'eventos' => Evento::all(),
            'flash' => [
                'success' => Session::get('success'),
                'error' => Session::get('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {

            $dataInicio = Carbon::createFromFormat('d/m/Y', $request->input('data_inicio'))->format('Y-m-d');
            $dataFim = Carbon::createFromFormat('d/m/Y', $request->input('data_fim'))->format('Y-m-d');
            $request->merge(['data_inicio' => $dataInicio, 'data_fim' => $dataFim]);

            $validated = $request->validate([
                'nome' => 'required|string|min:5|max:100',
                'descricao' => 'required|string|min:10|max:255',
                'local_do_evento' => 'required|string|max:100',
                'data_inicio' => 'required|date|after_or_equal:' . now()->format('Y-m-d'),
                'data_fim' => 'required|date|after_or_equal:data_inicio',
                'hora_inicio' => 'nullable|required_with:hora_fim',
                'hora_fim' => 'nullable|required_with:hora_inicio|date_format:H:i|after:hora_inicio',
                'tipo' => 'required|in:presencial,online,hibrido',
                'atividades.*.data' => 'required|date|after_or_equal:' . $dataInicio . '|before_or_equal:' . $dataFim,
                'atividades.*.hora_fim' => 'nullable|required_with:atividades.*.hora_inicio|date_format:H:i|after:atividades.*.hora_inicio',
                'atividades.*.hora_inicio' => 'nullable|required_with:atividades.*.hora_fim',
                'atividades.*.nome' => 'required|string|min:5|max:100',
                'curso' => 'nullable|array',
                'curso.nome' => 'required_with:curso|string|min:5|max:100',
                'curso.descricao' => 'required_with:curso|string|min:10|max:255',
                'curso.carga_horaria' => 'required_with:curso|numeric|min:1',
            ], [
                'nome.required' => 'O nome do evento é obrigatório.',
                'nome.min' => 'O nome do evento deve conter mais de 5 caracteres.',
                'nome.max' => 'O nome do evento não pode conter mais de 100 caracteres.',
                'descricao.min' => 'A descrição deve conter no minimo 10 caracteres.',
                'descricao.required' => 'A descrição do evento é obrigatório.',
                'data_inicio.after_or_equal' => 'A data de início não pode ser anterior a hoje.',
                'data_fim.after_or_equal' => 'A data fim não pode ser anterior a data de início.',
                'hora_fim.after' => 'A hora fim não pode ser anterior ou igual a hora de início',
                'atividades.*.data.required' => 'A data da atividade é obrigatória.',
                'atividades.*.data.after_or_equal' => 'O horário de início não pode ser antes da data inicial do evento.',
                'atividades.*.data.before_or_equal' => 'O horário de início não pode ser depois da data final do evento.',
                'atividades.*.hora_fim.after' => 'A hora fim da ativade não pode ser anterior ou igual a hora de início.',
                'atividades.*.nome.required' => 'O nome da atividade é obrigatório.',
                'atividades.*.nome.max' => 'O nome da atividade não pode conter mais de 100 caracteres.',
                'atividades.*.nome.min' => 'O nome da atividade deve conter mais de 5 caracteres.',
                'curso.nome.required' => 'O nome do curso é obrigatorio.',
                'curso.nome.max' => 'O nome do curso não pode conter mais de 100 caracteres.',
                'curso.nome.min' => 'O nome do curso deve conter mais de 5 caracteres.',
                'curso.descricao.required' => 'A descrição do curso é obrigatório.',
                'curso.descricao.min' => 'A descrição deve conter no minimo 10 caracteres.',
                'curso.carga_horaria.min' => 'A carga horária deve ser maior que 0.',
                'curso.carga_horaria.required' => 'A carga horária é obrigatória.',
            ]);
            $evento = Evento::create($validated);
            foreach ($request->input('atividades', []) as $atividadeData) {
                $evento->atividades()->create($atividadeData);
            }
            $cursoData = $request->input('curso');

            if ($cursoData) {
                $evento->curso()->create($cursoData);
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
            $atividades = $request->input('atividades', []);

            foreach ($atividades as $i => $atividade) {
                if (!empty($atividade['data'])) {
                    if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $atividade['data'])) {
                        $atividades[$i]['data'] = Carbon::createFromFormat(
                            'd/m/Y',
                            $atividade['data']
                        )->format('Y-m-d');
                    }
                }
            }

            $request->merge([
                'data_inicio' => Carbon::createFromFormat('d/m/Y', $request->input('data_inicio'))->format('Y-m-d'),
                'data_fim'    => Carbon::createFromFormat('d/m/Y', $request->input('data_fim'))->format('Y-m-d'),
                'atividades'  => $atividades,
            ]);

            $validated = $request->validate([
                'nome' => 'required|string|max:100',
                'local_do_evento' => 'required|string|max:100',
                'descricao' => 'required|string|max:255',
                'data_fim' => 'required|date|after_or_equal:data_inicio',
                'hora_inicio' => 'nullable|required_with:hora_fim',
                'hora_fim' => 'nullable|required_with:hora_inicio|date_format:H:i|after:hora_inicio',
                'tipo' => 'required|in:presencial,online,hibrido',
                'atividades.*.data' => 'required|date|after_or_equal:' . $dataInicio . '|before_or_equal:' . $dataFim,
                'atividades.*.hora_fim' => 'nullable|required_with:atividades.*.hora_inicio|date_format:H:i|after:atividades.*.hora_inicio',
                'atividades.*.hora_inicio' => 'nullable|required_with:atividades.*.hora_fim',
                'atividades.*.nome' => 'required|string|max:255',

                'curso.nome' => 'required|string|min:5|max:100',
                'curso.descricao' => 'required|string|min:10|max:255',
                'curso.carga_horaria' => 'required|numeric|min:1',
            ], [
                // EVENTO
                'nome.required' => 'O nome do evento é obrigatório.',
                'nome.min' => 'O nome do evento deve conter mais de 5 caracteres.',
                'nome.max' => 'O nome do evento não pode conter mais de 100 caracteres.',

                'tipo.required' => 'O tipo do evento é obrigatório.',
                'tipo.in' => 'O tipo do evento deve ser presencial, online ou híbrido.',

                'descricao.required' => 'A descrição do evento é obrigatória.',
                'descricao.min' => 'A descrição deve conter no minimo 10 caracteres.',
                'descricao.max' => 'A descrição não pode conter mais de 255 caracteres.',

                'local_do_evento.required' => 'O local do evento é obrigatório.',
                'local_do_evento.max' => 'O local do evento não pode conter mais de 100 caracteres.',

                'data_inicio.required' => 'A data de início é obrigatória.',
                'data_inicio.after_or_equal' => 'A data de início não pode ser anterior a hoje.',

                'data_fim.required' => 'A data fim é obrigatória.',
                'data_fim.after_or_equal' => 'A data fim não pode ser anterior a data de início.',
                'hora_fim.after' => 'A hora fim não pode ser anterior ou igual a hora de início.',

                'tipo.required' => 'O tipo do evento é obrigatório.',
                'tipo.in' => 'O tipo do evento deve ser presencial, online ou híbrido.',

                // ATIVIDADES
                'atividades.required' => 'É obrigatório cadastrar ao menos uma atividade.',

                'atividades.*.data.required' => 'A data da atividade é obrigatória.',
                'atividades.*.data.after_or_equal' => 'A data início não pode ser antes da data inicial do evento.',
                'atividades.*.data.before_or_equal' => 'A data de início não pode ser depois da data final do evento.',

                'atividades.*.hora_fim.after' => 'A hora fim da ativade não pode ser anterior ou igual a hora de início.',

                'atividades.*.nome.required' => 'O nome da atividade é obrigatório.',
                'atividades.*.nome.min' => 'O nome da atividade deve conter mais de 5 caracteres.',
                'atividades.*.nome.max' => 'O nome da atividade não pode conter mais de 100 caracteres.',

                // CURSO
                'curso.nome.required' => 'O nome do curso é obrigatorio.',
                'curso.nome.min' => 'O nome do curso deve conter mais de 5 caracteres.',
                'curso.nome.max' => 'O nome do curso não pode conter mais de 100 caracteres.',

                'curso.descricao.required' => 'A descrição do curso é obrigatória.',
                'curso.descricao.min' => 'A descrição deve conter no minimo 10 caracteres.',
                'curso.descricao.max' => 'A descrição não pode conter mais de 255 caracteres.',

                'curso.carga_horaria.required' => 'A carga horária do curso é obrigatória.',
                'curso.carga_horaria.min' => 'A carga horária deve ser maior que 0.',

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

                $evento->atividades()
                    ->whereNotIn('id', $atividadesIds)
                    ->delete();
            } else {
                $evento->atividades()->delete();
            }

            $cursoData = $request->input('curso');

            if ($cursoData) {
                if ($evento->curso) {
                    // Atualiza curso existente
                    $evento->curso->update($cursoData);
                } else {
                    // Cria curso se não existir
                    $evento->curso()->create($cursoData);
                }
            }

            return redirect()
                ->route('eventoShow', ['id' => $evento->id])
                ->with('success', 'Evento atualizado com sucesso.');

        } catch (ValidationException $exception) {
            return Inertia::render('events/editar-evento', [
                'evento' => $evento->load('atividades', 'curso'),
                'message' => $exception->getMessage(),
                'errors' => $exception->errors()
            ]);
        }
    }

    public function detalhesEvento($id) {
        $inscricoesPorDia = DB::table('evento_participante')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('evento_id', $id)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        $evento = DB::table('eventos')
            ->select('nome')
            ->where('id', $id)
            ->first();

        return Inertia::render('events/detalhe-evento', [
            'chartData' => $inscricoesPorDia,
            'eventoNome' => $evento?->nome,
            'eventoId' => $id
        ]);
    }

    public function detalhesParticipante($id)
    {
        $participantes = DB::table('evento_participante')
            ->join('participantes', 'evento_participante.participante_id', '=', 'participantes.id')
            ->select(
                'participantes.nome',
                'participantes.cpf',
                'participantes.instituicao',
                'participantes.categoria_profissional',
                DB::raw('DATE(evento_participante.created_at) as data_inscricao')
            )
            ->where('evento_participante.evento_id', $id)
            ->orderBy('evento_participante.created_at', 'desc')
            ->get();

        $evento = DB::table('eventos')
            ->select('nome')
            ->where('id', $id)
            ->first();

        return Inertia::render('events/detalhe-participantes', [
            'participantes' => $participantes,
            'eventoNome' => $evento?->nome,
        ]);
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

    public function createLinkForSignUp($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'cadastro_abertura' => 'required|date',
                'cadastro_encerramento' => 'required|date',

            ], [
                'cadastro_abertura.required' => 'O campo de data início é obrigatório',
                'cadastro_encerramento.required' => 'O campo de data fim é obrigatório'
            ]);

            $evento = Evento::findOrFail($id);

            $evento->update([
                'cadastro_abertura' => $validated['cadastro_abertura'],
                'cadastro_encerramento' => $validated['cadastro_encerramento'],
                'link_liberado' => true,
            ]);

            return redirect()
                ->route('eventoShow', ['id' => $evento->id])
                ->with('success', 'Link para cadastro no evento ativado com sucesso.')
                ;

        } catch (ValidationException $exception) {
            return redirect()->back()->withErrors($exception->errors());
        }
    }

    public function createQrCode(Evento $evento)
    {
        try {
            $url = route('confirmarPresenca', ['id' => $evento->id]);

            $qrCode = new QrCode($url);

            $writer = new PngWriter();
            $qrCodeData = $writer->write($qrCode);
            $base64 = base64_encode($qrCodeData->getString());

            $evento->qr_code_base64 = $base64;
            $evento->qr_code_gerado = true;
            $evento->save();

            return redirect()
                ->route('eventoShow', ['id' => $evento->id])
                ->with('success', 'QrCode para confirmar participação no evento gerado com sucesso.')
                ;
        } catch (\Exception $exception) {
            return redirect()->back()->withErrors($exception->errors());
        }
    }

    public function importarParticipantes(Request $request)
    {
        try {
            $request->validate([
                'arquivo' => 'required|file|mimes:xlsx,xls|max:102400', // 100MB
                'evento_id' => 'required'
            ], [
                'arquivo.mimes' => 'O arquivo deve ser no formato Excel, XLSX ou XLS!',
                'arquivo.max' => 'O tamanho máximo permitido para o arquivo é 100MB.'
            ]);

            Excel::import(new ParticipantesImport($request->evento_id), $request->file('arquivo'));

            return redirect()->route('listarEventos')->with('success', 'Participantes importados com sucesso.');
        } catch (ExcelValidationException $e) {
            $messages = [];

            foreach ($e->failures() as $failure) {
                foreach ($failure->errors() as $error) {
                    $messages[] = $error;
                }
            }

            return redirect()->back()->withErrors($messages);
        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        }
    }

    public function relatorioView(Request $request)
    {
        $eventos = Evento::select('id', 'nome')->orderBy('nome')->get();

        $participantes = [];
        $colunasSelecionadas = [];
        $eventoSelecionado = null;

        // Pega filtros da session
        $filtros = $request->session()->get('relatorio_filtros');

        if ($filtros) {
            $evento = Evento::with('participantes')->findOrFail($filtros['evento_id']);
            $eventoSelecionado = $evento->id;

            $participantes = $evento->participantes->map(function ($p) use ($filtros) {
                $dados = [];

                foreach ($filtros['colunas'] as $coluna) {
                    if ($coluna === 'data_inscricao') {
                        $dados['data_inscricao'] = $p->pivot->created_at->format('d/m/Y H:i');
                    } elseif ($coluna === 'status') {
                        $dados['status'] = $p->pivot->status;
                    } else {
                        $dados[$coluna] = $p->{$coluna} ?? '-';
                    }
                }

                return $dados;
            });

            $colunasSelecionadas = $filtros['colunas'];

            // Opcional: limpa os filtros da session, para não ficar armazenado
            $request->session()->forget('relatorio_filtros');
        }

        return Inertia::render('relatorios/relatorio-participante', [
            'eventos' => $eventos,
            'participantes' => $participantes,
            'colunasSelecionadas' => $colunasSelecionadas,
            'eventoSelecionado' => $eventoSelecionado,
        ]);
    }

    public function gerarRelatorio(Request $request)
    {
        $request->validate([
            'evento_id' => 'required|exists:eventos,id',
            'colunas' => 'array',
        ]);

        // Armazena filtros na sessão
        $request->session()->put('relatorio_filtros', [
            'evento_id' => $request->evento_id,
            'colunas' => $request->colunas,
        ]);

        // Redireciona para a rota GET sem parâmetros na URL
        return redirect()->route('relatorios');
    }

    public function exportarExcel(Request $request)
    {
        $eventoId = $request->input('evento_id');
        $colunas = $request->input('colunas', []);

        $evento = Evento::find($eventoId);

        $nomeArquivo = 'relatorio_evento_' . Str::slug($evento->nome) . '.xlsx';

        $arquivo = Excel::download(new ParticipantesExport($eventoId, $colunas, $evento->sha256_token), $nomeArquivo);
        return  $arquivo;
    }

    public function showValidacaoForm()
    {
        return Inertia::render('events/validar-hash', [
            'flash' => [
                'success' => Session::get('success'),
            ],
        ]);
    }

    public function validarHash(Request $request)
    {
        try {
            $request->validate([
                'hash' => ['required', 'string', 'size:64', 'regex:/^[a-f0-9]{64}$/i'],
            ], [
                'hash.required' => 'O hash é obrigatório.',
                'hash.string'   => 'O hash deve ser uma string.',
                'hash.size'     => 'O hash deve conter exatamente 64 caracteres.',
                'hash.regex'    => 'O hash deve conter apenas caracteres válidos (0-9 e a-f).',
            ]);

            $usuario = auth()->user();
            $evento = Evento::where('sha256_token', $request->hash)->first();

            if (! $evento) {
                throw ValidationException::withMessages([
                    'hash' => ['Hash inválido.'],
                ]);
            }

            // Verifica se o usuário já validou
            $jaValidado = $evento->validadores()->where('evento_user_validacoes.user_id', $usuario->id)->exists();

            if ($jaValidado) {
                throw ValidationException::withMessages([
                    'hash' => ['Você já validou esse evento.'],
                ]);
            }

            $evento->validadores()->attach($usuario->id, [
                'validado_em' => now()
            ]);

            return redirect()->route('validarHashForm')
                ->with('success', "Hash válido! Esse código pertence ao evento $evento->nome")
                ->with(
                    'evento', [
                        'id' => $evento->id,
                        'nome' => $evento->nome,
                    ]
                )
                ;

        } catch (ValidationException $exception) {
            return Inertia::render('events/validar-hash', [
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ]);
        }
    }

    public function relacionarModelo(Evento $evento)
    {
        $modelos = CertificadoModelo::all();

        return Inertia::render('events/relacionar-modelo', [
            'evento' => $evento,
            'modelos' => $modelos,
        ]);
    }

    public function atualizarModelo(Request $request, Evento $evento)
    {
        try {
            $request->validate([
                'certificado_modelo_id' => 'required|exists:certificado_modelos,id',
            ], [
                'certificado_modelo_id.required' => 'O campo de seleção é obrigatório.'
            ]);

            $evento->certificado_modelo_id = $request->certificado_modelo_id;
            $evento->save();

            return redirect()->route('eventoShow', $evento->id)->with('success', 'Modelo de certificado relacionado com sucesso!');
        } catch (ValidationException $exception) {
            return redirect()->back()->withErrors($exception->errors());
        }
    }
}
