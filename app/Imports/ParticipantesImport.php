<?php

namespace App\Imports;

use App\Models\Participante;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ParticipantesImport implements ToModel, WithHeadingRow, WithValidation
{
    protected int $eventoId;

    public function __construct(int $eventoId)
    {
        $this->eventoId = $eventoId;
    }

    public function model(array $row)
    {
        $participante = Participante::updateOrCreate(
            ['cpf' => $row['cpf']],
            [
                'nome' => $row['nome'],
                'email' => $row['e_mail'],
                'telefone' => $row['telefone'],
                'instituicao' => $row['instituicao'] ?? null,
                'municipio' => $row['municipio'],
                'categoria_profissional' => $row['categoria_profissional'],
                'numero_inscricao' => $row['numero_coren'] ?? null,
            ]
        );

        $participante->eventos()->syncWithoutDetaching([$this->eventoId]);

        return $participante;
    }

    public function rules(): array
    {
        return [
            'cpf' => ['required', 'regex:/^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/'],
            'nome' => ['required', 'string'],
            'e_mail' => ['required', 'email'],
            'telefone' => ['required', 'string'],
            'instituicao' => ['nullable', 'string'],
            'municipio' => ['required', 'string'],
            'categoria_profissional' => ['required', 'string'],
            'numero_coren' => ['nullable'],
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'cpf.required' => 'O campo CPF é obrigatório na planilha.',
            'cpf.regex' => 'O CPF deve ser válido, podendo conter ou não pontuação.',
            'nome.required' => 'O campo Nome é obrigatório na planilha.',
            'e_mail.required' => 'O campo E-mail é obrigatório na planilha.',
            'e_mail.email' => 'O campo E-mail deve ser um endereço válido.',
            'telefone.required' => 'O campo Telefone é obrigatório na planilha.',
            'municipio.required' => 'O campo Município é obrigatório na planilha.',
            'categoria_profissional.required' => 'O campo Categoria Profissional é obrigatório na planilha.',
        ];
    }
}
