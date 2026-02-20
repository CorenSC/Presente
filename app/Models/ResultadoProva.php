<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResultadoProva extends Model
{
    use HasFactory;

    protected $table = 'resultados_provas';

    protected $fillable = [
        'inscrito_id',   // evento_participante.id
        'prova_id',
        'nota_obtida',
        'aprovado',
        'realizado_em',
    ];

    protected $casts = [
        'nota_obtida' => 'decimal:2',
        'aprovado' => 'boolean',
        'realizado_em' => 'datetime',
    ];

    public function inscricao()
    {
        return $this->belongsTo(EventoParticipante::class, 'inscrito_id');
    }

    public function prova()
    {
        return $this->belongsTo(Prova::class);
    }
}
