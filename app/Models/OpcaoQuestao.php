<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OpcaoQuestao extends Model
{
    use HasFactory;

    protected $table = 'opcoes_questoes';

    protected $fillable = [
        'questao_id',
        'texto',
        'correta',
        'ordem',
    ];

    protected $casts = [
        'correta' => 'boolean',
    ];

    public function questao()
    {
        return $this->belongsTo(Questao::class);
    }
}
