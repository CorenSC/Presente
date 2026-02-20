<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('local_do_evento');
            $table->text('descricao');
            $table->date('data_inicio');
            $table->date('data_fim');
            $table->date('cadastro_abertura')->nullable();
            $table->date('cadastro_encerramento')->nullable();
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fim')->nullable();
            $table->boolean('ativo')->default(true);
            $table->boolean('link_liberado')->default(false);
            $table->boolean('qr_code_gerado')->default(false);
            $table->longText('qr_code_base64')->nullable();
            $table->char('sha256_token', 64)->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};
