<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CertificadoModelo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'imagem_fundo',
        'conteudo',
    ];

    public function eventos()
    {
        return $this->hasMany(Evento::class, 'certificado_modelo_id');
    }
}
