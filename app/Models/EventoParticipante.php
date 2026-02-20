<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EventoParticipante extends Model
{
    use HasFactory;

    protected $table = 'evento_participante';

    protected $fillable = [
        'evento_id',
        'participante_id',
        'status',
    ];

    public function evento()
    {
        return $this->belongsTo(Evento::class);
    }

    public function participante()
    {
        return $this->belongsTo(Participante::class);
    }

    /** RELAÇÕES COM PROGRESSO EAD */

    public function conteudosConcluidos()
    {
        return $this->hasMany(ConteudoConcluido::class, 'inscrito_id');
    }

    public function modulosConcluidos()
    {
        return $this->hasMany(ModuloConcluido::class, 'inscrito_id');
    }

    public function cursosConcluidos()
    {
        return $this->hasMany(CursoConcluido::class, 'inscrito_id');
    }

    public function resultadosProvas()
    {
        return $this->hasMany(ResultadoProva::class, 'inscrito_id');
    }
}
