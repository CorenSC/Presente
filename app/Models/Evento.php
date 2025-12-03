<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @method static \Illuminate\Database\Eloquent\Builder create(array $attributes)
 * @method static \Illuminate\Database\Eloquent\Builder  findOrFail(int $id)
 */
class Evento extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'local_do_evento',
        'descricao',
        'data_inicio',
        'data_fim',
        'hora_inicio',
        'hora_fim',
        'ativo',
        'link_liberado',
        'qr_code_gerado',
        'qr_code_base64'
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
            'link_liberado' => 'boolean',
            'qr_code_gerado' => 'boolean',
        ];
    }

    public function participantes()
    {
        return $this->belongsToMany(Participante::class)
                    ->withPivot(['status'])
                    ->withTimestamps();
    }

    public function atividades()
    {
        return $this->hasMany(Atividade::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($evento) {
            $evento->sha256_token = hash('sha256', Str::uuid());
        });
    }

    public function validadores()
    {
        return $this->belongsToMany(User::class, 'evento_user_validacoes')
            ->withPivot(['validado_em'])
            ->withTimestamps();
    }

    public function certificadoModelo()
    {
        return $this->belongsTo(CertificadoModelo::class, 'certificado_modelo_id');
    }

    public function certificados()
    {
        return $this->hasMany(Certificado::class);
    }
}
