<?php

namespace App\Http\Controllers;

use App\Models\CertificadoModelo;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ModeloCertificadoController extends Controller
{

    public function index()
    {
        return Inertia::render('modelo-certificado/lista', [
            'modelos' => CertificadoModelo::all(),
            'flash' => [
                'success' => Session::get('success'),
                'error' => Session::get('error'),
            ],
        ]);
    }

    public function modeloCertificado()
    {
        return Inertia::render('modelo-certificado/modelo-certificado');
    }

    public function modeloStore(Request $request)
    {
        try {
            $request->validate([
                'nome' => 'required|string|max:255',
                'conteudo' => 'required|string',
                'imagem_fundo' => 'required|image|mimes:jpeg,png,jpg|max:102400',
            ], [
                'imagem_fundo.mimes' => 'Só é permitido as imagens em formato: JPEG, JPG ou PNG.',
                'imagem_fundo.max' => 'O tamanho max da imagem pode ser de até 100MB'
            ]);

            $path = $request->file('imagem_fundo')->store('certificados', 'public');

            $certificadoModelo = CertificadoModelo::create([
                'nome' => $request->input('nome'),
                'conteudo' => $request->input('conteudo'),
                'imagem_fundo' => $path,
            ]);

            return redirect()
                ->route('modeloCertificadoShow', ['id' => $certificadoModelo->id])
                ->with('success', 'Evento cadastrado com sucesso.')
                ;

        }  catch (ValidationException $exception) {
            return redirect()->back()->withErrors($exception->errors());
        }
    }

    public function update(Request $request, CertificadoModelo $modelo)
    {
        try {
            $request->validate([
                'nome' => 'required|string|max:255',
                'conteudo' => 'required|string',
                'imagem_fundo' => 'nullable|image|mimes:jpeg,png,jpg|max:102400',
            ], [
                'imagem_fundo.mimes' => 'Só é permitido as imagens em formato: JPEG, JPG ou PNG.',
                'imagem_fundo.max' => 'O tamanho máximo da imagem pode ser de até 100MB',
            ]);

            $dados = $request->only(['nome', 'conteudo']);

            if ($request->hasFile('imagem_fundo')) {
                $path = $request->file('imagem_fundo')->store('certificados', 'public');
                $dados['imagem_fundo'] = $path;
            } else {
                // Se nenhuma imagem nova for enviada, mantém a imagem atual
                $dados['imagem_fundo'] = $modelo->imagem_fundo;
            }

            $modelo->update($dados);

            return redirect()
                ->route('modeloCertificadoShow', ['id' => $modelo->id])
                ->with('success', 'Modelo de certificado atualizado com sucesso.');

        } catch (ValidationException $exception) {
            return redirect()->back()->withErrors($exception->errors());
        }
    }

}
