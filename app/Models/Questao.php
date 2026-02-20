<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Questao extends Model
{
    use HasFactory;

    protected $table = 'questoes';

    protected $fillable = [
        'prova_id',
        'enunciado',
        'tipo',
        'ordem',
    ];

    public function prova()
    {
        return $this->belongsTo(Prova::class);
    }

    public function opcoes()
    {
        return $this->hasMany(OpcaoQuestao::class);
    }
}
