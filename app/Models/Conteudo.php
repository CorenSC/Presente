<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conteudo extends Model
{
    use HasFactory;

    protected $table = 'conteudos';

    protected $fillable = [
        'aula_id',
        'tipo',
        'video_yt_id',
        'texto',
        'link_url',      
        'arquivo_path',
        'arquivo_nome',
        'arquivo_mime',
        'arquivo_size',
        'ordem',
    ];

    public function aula()
    {
        return $this->belongsTo(Aula::class);
    }
}
