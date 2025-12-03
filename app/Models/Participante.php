<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Participante extends Model implements AuthenticatableContract
{
    use HasFactory, Authenticatable;

    protected $fillable = [
        'nome',
        'cpf',
        'telefone',
        'email',
        'categoria_profissional',
        'numero_inscricao',
        'municipio',
        'instituicao',
    ];

    public function eventos()
    {
        return $this->belongsToMany(Evento::class)
            ->withPivot(['status'])
            ->withTimestamps();
    }

    public function certificados()
    {
        return $this->hasMany(Certificado::class);
    }
}
