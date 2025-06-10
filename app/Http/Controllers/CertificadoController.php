<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Certificado;
use App\Models\Participante;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\CertificadoDisponivelMail;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificadoController extends Controller
{
    public function liberarCertificados(Evento $evento)
    {
        $participantes = $evento->participantes()
            ->wherePivot('status', 'confirmado')
            ->get();

        if (!$evento->certificado_modelo_id || !$evento->certificadoModelo) {
            return back()->with('error', 'Modelo de certificado não está relacionado ao evento.');
        }

        foreach ($participantes as $participante) {
            // Verifica se já existe um certificado
            if (Certificado::where('evento_id', $evento->id)->where('participante_id', $participante->id)->exists()) {
                continue;
            }

            $modelo = $evento->certificadoModelo;

            $atividadesTexto = $evento->atividades->pluck('nome')->implode(', ');

            $substituicoes = [
                '{participante.nome}'   => $participante->nome,
                '{evento.nome}'         => $evento->nome,
                '{evento.data_inicio}'  => $evento->data_inicio ? \Carbon\Carbon::parse($evento->data_inicio)->format('d/m/Y') : '',
                '{evento.data_fim}'     => $evento->data_fim ? \Carbon\Carbon::parse($evento->data_fim)->format('d/m/Y') : '',
                '{evento.atividades}'   => $atividadesTexto,
            ];

            $conteudo = str_replace(array_keys($substituicoes), array_values($substituicoes), $modelo->conteudo);

            $hash = Str::random(40);

            $pdf = Pdf::loadView('certificados.template', [
                'conteudo' => $conteudo,
                'imagem_fundo' => $modelo->imagem_fundo,
                'hash' => $hash
            ]);

            $filename = 'certificados_temp/' . Str::uuid() . '.pdf';
            Storage::disk('public')->put($filename, $pdf->output());

            Certificado::create([
                'evento_id' => $evento->id,
                'participante_id' => $participante->id,
                'arquivo' => $filename,
                'hash' => $hash,
            ]);

            Mail::to($participante->email)->send(new CertificadoDisponivelMail($participante, $evento));
        }

        return back()->with('success', 'Certificados liberados com sucesso!');
    }

    public function validar($hash)
    {
        $certificado = Certificado::where('hash', $hash)->firstOrFail();

        return view('certificados.validar', compact('certificado'));
    }

    public function download($hash)
    {
        $certificado = Certificado::where('hash', $hash)->firstOrFail();

        $filePath = $certificado->arquivo; // ex: certificados_temp/uuid.pdf

        if (!Storage::disk('public')->exists($filePath)) {
            abort(404, 'Arquivo não encontrado.');
        }

        return Storage::disk('public')->download($filePath, 'certificado.pdf', [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="certificado.pdf"',
        ]);
    }

}

