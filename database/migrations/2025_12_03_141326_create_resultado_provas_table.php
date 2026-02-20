<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultados_provas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscrito_id')->constrained('evento_participante')->onDelete('cascade');
            $table->foreignId('prova_id')->constrained()->onDelete('cascade');
            $table->decimal('nota_obtida', 5, 2);
            $table->boolean('aprovado')->default(false);
            $table->timestamp('realizado_em');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultados_provas');
    }
};
