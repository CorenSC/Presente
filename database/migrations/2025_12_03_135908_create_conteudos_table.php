<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conteudos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('aula_id')
                ->constrained('aulas')
                ->onDelete('cascade');

            $table->enum('tipo', ['video', 'texto', 'anexo', 'link']);

            // vídeo
            $table->string('video_yt_id')->nullable();

            // texto
            $table->text('texto')->nullable();

            // link
            $table->text('link_url')->nullable();

            // anexo (via storage)
            $table->string('arquivo_path')->nullable(); // storage/app/public/...
            $table->string('arquivo_nome')->nullable(); // nome original
            $table->string('arquivo_mime')->nullable(); // application/pdf, image/png...
            $table->unsignedBigInteger('arquivo_size')->nullable(); // bytes

            $table->integer('ordem');

            $table->timestamps();

            // garante ordem única por aula
            $table->unique(['aula_id', 'ordem']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conteudos');
    }
};
