<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Prova extends Model
{
    use HasFactory;

    protected $table = 'provas';

    protected $fillable = [
        'modulo_id',
        'titulo',
        'descricao',
        'nota_minima',
        'tentativas_maximas',
    ];

    public function modulo()
    {
        return $this->belongsTo(Modulo::class);
    }

    public function questoes()
    {
        return $this->hasMany(Questao::class)->orderBy('ordem');
    }

    public function resultados()
    {
        return $this->hasMany(ResultadoProva::class);
    }
}
