<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Modulo extends Model
{
    use HasFactory;

    protected $table = 'modulos';

    protected $fillable = [
        'curso_id',
        'nome',
        'descricao',
        'data_inicio',
        'data_fim',
        'ordem',
        'tem_prova',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'tem_prova' => 'boolean',
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function aula()
    {
        return $this->hasMany(Aula::class)->orderBy('ordem');
    }

    public function prova()
    {
        return $this->hasOne(Prova::class);
    }

    public function modulosConcluidos()
    {
        return $this->hasMany(ModuloConcluido::class);
    }
}
