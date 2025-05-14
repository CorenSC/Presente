<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participante extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'cpf',
        'telefone',
        'email',
        'categoria_profissional',
        'numero_inscricao',
        'municipio',
        'instituicao'
    ];

    public function eventos()
    {
        return $this->belongsToMany(Evento::class)
                     ->withPivot(['status'])
                     ->withTimestamps();
    }
}
