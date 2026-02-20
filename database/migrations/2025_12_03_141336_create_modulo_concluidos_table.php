<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modulos_concluidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscrito_id')->constrained('evento_participante')->onDelete('cascade');
            $table->foreignId('modulo_id')->constrained()->onDelete('cascade');
            $table->timestamp('concluido_em');
            $table->timestamps();

            $table->unique(['inscrito_id', 'modulo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modulos_concluidos');
    }
};
