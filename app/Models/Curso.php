<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @method static \Illuminate\Database\Eloquent\Builder create(array $attributes)
 * @method static \Illuminate\Database\Eloquent\Builder  findOrFail(int $id)
 */
class Curso extends Model
{
    use HasFactory;

    protected $table = 'cursos';

    protected $fillable = [
        'evento_id',
        'nome',
        'descricao',
        'carga_horaria',
    ];

    public function evento()
    {
        return $this->belongsTo(Evento::class);
    }

    public function modulos()
    {
        return $this->hasMany(Modulo::class)->orderBy('ordem');
    }

    public function cursosConcluidos()
    {
        return $this->hasMany(CursoConcluido::class);
    }
}
