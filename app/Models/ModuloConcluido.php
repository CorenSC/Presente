<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ModuloConcluido extends Model
{
    use HasFactory;

    protected $table = 'modulos_concluidos';

    protected $fillable = [
        'inscrito_id',
        'modulo_id',
        'concluido_em',
    ];

    protected $casts = [
        'concluido_em' => 'datetime',
    ];

    public function inscricao()
    {
        return $this->belongsTo(EventoParticipante::class, 'inscrito_id');
    }

    public function modulo()
    {
        return $this->belongsTo(Modulo::class);
    }
}
