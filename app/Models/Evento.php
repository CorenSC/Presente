<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static \Illuminate\Database\Eloquent\Builder create(array $attributes)
 */
class Evento extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'local_do_evento',
        'data_inicio',
        'data_fim',
        'hora_inicio',
        'hora_fim',
        'ativo',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ativo' => 'boolean',
        ];
    }
}
