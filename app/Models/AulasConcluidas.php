<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AulasConcluidas extends Model
{
    use HasFactory;

    protected $table = 'aulas_concluidas';

    protected $fillable = [
        'inscrito_id',
        'aula_id',
        'concluido_em',
    ];

    protected $casts = [
        'concluido_em' => 'datetime',
    ];

    public function inscricao()
    {
        return $this->belongsTo(EventoParticipante::class, 'inscrito_id');
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class);
    }
}
