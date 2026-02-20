<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CursoConcluido extends Model
{
    use HasFactory;

    protected $table = 'cursos_concluidos';

    protected $fillable = [
        'inscrito_id',
        'curso_id',
        'concluido_em',
    ];

    protected $casts = [
        'concluido_em' => 'datetime',
    ];

    public function inscricao()
    {
        return $this->belongsTo(EventoParticipante::class, 'inscrito_id');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }
}
