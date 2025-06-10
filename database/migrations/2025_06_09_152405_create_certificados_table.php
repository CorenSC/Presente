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
        Schema::create('certificados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_id')->constrained()->onDelete('cascade');
            $table->foreignId('participante_id')->constrained()->onDelete('cascade');
            $table->string('arquivo'); // Caminho para o PDF
            $table->string('hash', 40)->unique(); // Para validação
            $table->timestamps();

            $table->unique(['evento_id', 'participante_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificados');
    }
};
