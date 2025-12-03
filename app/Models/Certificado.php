<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificado extends Model
{
    use HasFactory;

    protected $fillable = [
        'evento_id',
        'participante_id',
        'arquivo',
        'hash',
    ];

    public function evento()
    {
        return $this->belongsTo(Evento::class);
    }

    public function participante() {
        return $this->belongsTo(Participante::class);
    }
}
