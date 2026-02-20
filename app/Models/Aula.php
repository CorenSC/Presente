<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    use HasFactory;

    protected $table = 'aulas';

    protected $fillable = [
        'modulo_id',
        'titulo',
        'descricao',
        'ordem',
        'publicada'
    ];
    protected $casts = [
        'publicada' => 'boolean'
    ];

    public function modulo()
    {
        return $this->belongsTo(Modulo::class);
    }

    public function conteudos()
    {
        return $this->hasMany(Conteudo::class)->orderBy('ordem');
    }

    public function aulasConcluidas()
    {
        return $this->hasMany(AulasConcluidas::class);
    }
}
