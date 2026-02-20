<?php

namespace App\Http\Controllers;

use App\Models\Aula;
use App\Models\Conteudo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ConteudoController extends Controller
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
    public function store(Request $request, Aula $aula)
    {
        // ✅ Normaliza links ANTES de validar (permite salvar sem https://)
        $normalizedLinks = collect($request->input('links', []))->map(function ($item) {
            $url = trim((string) ($item['url'] ?? ''));

            if ($url !== '' && !preg_match('/^https?:\/\//i', $url)) {
                $url = 'https://' . $url;
            }

            return ['url' => $url];
        })->toArray();

        $request->merge(['links' => $normalizedLinks]);

        $validated = $request->validate(
            [
                'tipo' => ['required', 'in:video,texto,link,anexo'],

                'video_yt_id' => ['nullable', 'string', 'max:50'],
                'texto' => ['nullable', 'string'],

                // ✅ múltiplos links
                'links' => ['nullable', 'array'],
                'links.*.url' => ['nullable', 'url'],

                'arquivo' => ['nullable', 'file', 'max:20480'], // 20MB
            ],
            [
                'tipo.required' => 'Escolha o tipo do conteúdo.',
                'tipo.in' => 'Tipo inválido.',

                'links.*.url.url' => 'Informe uma URL válida.',

                'arquivo.max' => 'O arquivo pode ter no máximo 20MB.',
            ]
        );

        // pega a ordem base uma vez
        $ordemBase = Conteudo::where('aula_id', $aula->id)->max('ordem') ?? 0;

        // ===== VIDEO =====
        if ($validated['tipo'] === 'video') {
            if (empty($validated['video_yt_id'])) {
                return back()->withErrors(['video_yt_id' => 'Informe o ID do vídeo do YouTube.']);
            }

            Conteudo::create([
                'aula_id' => $aula->id,
                'tipo' => 'video',
                'video_yt_id' => $validated['video_yt_id'],

                'texto' => null,
                'link_url' => null,

                'arquivo_path' => null,
                'arquivo_nome' => null,
                'arquivo_mime' => null,
                'arquivo_size' => null,

                'ordem' => $ordemBase + 1,
            ]);

            return redirect()
                ->route('conteudosGerenciar', ['aula' => $aula->id])
                ->with('success', 'Conteúdo adicionado com sucesso!');
        }

        // ===== TEXTO =====
        if ($validated['tipo'] === 'texto') {
            if (empty($validated['texto'])) {
                return back()->withErrors(['texto' => 'Informe o texto do conteúdo.']);
            }

            Conteudo::create([
                'aula_id' => $aula->id,
                'tipo' => 'texto',
                'texto' => $validated['texto'],

                'video_yt_id' => null,
                'link_url' => null,

                'arquivo_path' => null,
                'arquivo_nome' => null,
                'arquivo_mime' => null,
                'arquivo_size' => null,

                'ordem' => $ordemBase + 1,
            ]);

            return redirect()
                ->route('conteudosGerenciar', ['aula' => $aula->id])
                ->with('success', 'Conteúdo adicionado com sucesso!');
        }

        // ===== LINK (múltiplos) =====
        if ($validated['tipo'] === 'link') {
            $links = collect($request->input('links', []))
                ->pluck('url')
                ->filter(fn ($u) => is_string($u) && trim($u) !== '')
                ->values();

            if ($links->isEmpty()) {
                return back()->withErrors(['links.0.url' => 'Informe pelo menos um link.']);
            }

            foreach ($links as $i => $url) {
                Conteudo::create([
                    'aula_id' => $aula->id,
                    'tipo' => 'link',
                    'link_url' => $url,

                    'video_yt_id' => null,
                    'texto' => null,

                    'arquivo_path' => null,
                    'arquivo_nome' => null,
                    'arquivo_mime' => null,
                    'arquivo_size' => null,

                    'ordem' => $ordemBase + 1 + $i,
                ]);
            }

            return redirect()
                ->route('conteudosGerenciar', ['aula' => $aula->id])
                ->with('success', 'Links adicionados com sucesso!');
        }

        // ===== ANEXO =====
        if (!$request->hasFile('arquivo')) {
            return back()->withErrors(['arquivo' => 'Selecione um arquivo.']);
        }

        $file = $request->file('arquivo');

        $arquivoPath = $file->store("conteudos/aula-{$aula->id}", 'public');
        $arquivoNome = $file->getClientOriginalName();
        $arquivoMime = $file->getClientMimeType();
        $arquivoSize = $file->getSize();

        Conteudo::create([
            'aula_id' => $aula->id,
            'tipo' => 'anexo',

            'video_yt_id' => null,
            'texto' => null,
            'link_url' => null,

            'arquivo_path' => $arquivoPath,
            'arquivo_nome' => $arquivoNome,
            'arquivo_mime' => $arquivoMime,
            'arquivo_size' => $arquivoSize,

            'ordem' => $ordemBase + 1,
        ]);

        return redirect()
            ->route('conteudosGerenciar', ['aula' => $aula->id])
            ->with('success', 'Conteúdo adicionado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Conteudo $conteudo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Conteudo $conteudo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Conteudo $conteudo)
    {
        // ✅ normaliza link antes de validar (permite salvar sem https://)
        $rawLink = trim((string) $request->input('link_url', ''));
        if ($rawLink !== '' && !preg_match('/^https?:\/\//i', $rawLink)) {
            $request->merge(['link_url' => 'https://' . $rawLink]);
        }

        $validated = $request->validate(
            [
                'tipo' => ['required', 'in:video,texto,link,anexo'],
                'video_yt_id' => ['nullable', 'string', 'max:50'],
                'texto' => ['nullable', 'string'],
                'link_url' => ['nullable', 'url'],
                'arquivo' => ['nullable', 'file', 'max:20480'], // 20MB
            ],
            [
                'tipo.required' => 'Escolha o tipo do conteúdo.',
                'tipo.in' => 'Tipo inválido.',
                'link_url.url' => 'Informe uma URL válida.',
                'arquivo.max' => 'O arquivo pode ter no máximo 20MB.',
            ]
        );

        // Regras por tipo
        if ($validated['tipo'] === 'video' && empty($validated['video_yt_id'])) {
            return back()->withErrors(['video_yt_id' => 'Informe o ID do vídeo do YouTube.']);
        }

        if ($validated['tipo'] === 'texto' && empty($validated['texto'])) {
            return back()->withErrors(['texto' => 'Informe o texto do conteúdo.']);
        }

        if ($validated['tipo'] === 'link' && empty($validated['link_url'])) {
            return back()->withErrors(['link_url' => 'Informe o link.']);
        }

        // Se for anexo, pode trocar o arquivo (opcional)
        $novoArquivoPath = $conteudo->arquivo_path;
        $novoArquivoNome = $conteudo->arquivo_nome;
        $novoArquivoMime = $conteudo->arquivo_mime;
        $novoArquivoSize = $conteudo->arquivo_size;

        if ($validated['tipo'] === 'anexo') {
            // se mandou arquivo novo, troca
            if ($request->hasFile('arquivo')) {
                // apaga antigo se existir
                if ($conteudo->arquivo_path) {
                    Storage::disk('public')->delete($conteudo->arquivo_path);
                }

                $file = $request->file('arquivo');
                $novoArquivoPath = $file->store("conteudos/aula-{$conteudo->aula_id}", 'public');
                $novoArquivoNome = $file->getClientOriginalName();
                $novoArquivoMime = $file->getClientMimeType();
                $novoArquivoSize = $file->getSize();
            }

            // se não mandou arquivo e não tem um salvo, erro
            if (!$novoArquivoPath) {
                return back()->withErrors(['arquivo' => 'Selecione um arquivo para o anexo.']);
            }
        } else {
            // se mudar para outro tipo, limpa campos de arquivo
            if ($conteudo->arquivo_path) {
                Storage::disk('public')->delete($conteudo->arquivo_path);
            }
            $novoArquivoPath = null;
            $novoArquivoNome = null;
            $novoArquivoMime = null;
            $novoArquivoSize = null;
        }

        $conteudo->update([
            'tipo' => $validated['tipo'],

            'video_yt_id' => $validated['tipo'] === 'video' ? $validated['video_yt_id'] : null,
            'texto' => $validated['tipo'] === 'texto' ? $validated['texto'] : null,
            'link_url' => $validated['tipo'] === 'link' ? $validated['link_url'] : null,

            'arquivo_path' => $novoArquivoPath,
            'arquivo_nome' => $novoArquivoNome,
            'arquivo_mime' => $novoArquivoMime,
            'arquivo_size' => $novoArquivoSize,
        ]);

        return redirect()
            ->route('conteudosGerenciar', ['aula' => $conteudo->aula_id])
            ->with('success', 'Conteúdo atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Conteudo $conteudo)
    {
        $aulaId = $conteudo->aula_id;

        // se tiver arquivo
        if ($conteudo->arquivo_path) {
            Storage::disk('public')->delete($conteudo->arquivo_path);
        }

        $conteudo->delete();

        // ✅ Reordenar (1..N)
        $conteudos = Conteudo::where('aula_id', $aulaId)
            ->orderBy('ordem')
            ->get();

        foreach ($conteudos as $index => $c) {
            $c->update(['ordem' => $index + 1]);
        }

        return redirect()
            ->route('conteudosGerenciar', ['aula' => $aulaId])
            ->with('success', 'Conteúdo excluído com sucesso!');
    }

    public function reordenar(Request $request, Aula $aula)
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ])['ids'];

        $ids = array_values(array_unique(array_map('intval', $ids)));

        $countValidos = Conteudo::where('aula_id', $aula->id)
            ->whereIn('id', $ids)
            ->count();

        abort_unless($countValidos === count($ids), 422);

        DB::transaction(function () use ($ids, $aula) {
            // ✅ fase 1: joga todo mundo pra ordem TEMPORÁRIA (negativa) pra liberar o unique
            foreach ($ids as $i => $id) {
                Conteudo::where('aula_id', $aula->id)
                    ->where('id', $id)
                    ->update(['ordem' => -($i + 1)]);
            }

            // ✅ fase 2: aplica ordem final 1..N
            foreach ($ids as $i => $id) {
                Conteudo::where('aula_id', $aula->id)
                    ->where('id', $id)
                    ->update(['ordem' => $i + 1]);
            }
        });

        return back()->with('success', 'Ordem dos conteúdos atualizada!');
    }
}
