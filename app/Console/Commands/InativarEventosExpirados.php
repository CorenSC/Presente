<?php

namespace App\Console\Commands;

use App\Models\Evento;
use Carbon\Carbon;
use Illuminate\Console\Command;

class InativarEventosExpirados extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'eventos:inativar-expirados';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Inativa eventos que já passaram a data final';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hoje = Carbon::now('America/Sao_Paulo')->startOfDay();

        $eventos = Evento::whereDate('data_fim', '<', $hoje->toDateString())
            ->where('ativo', true)
            ->get()
        ;

        $total = 0;

        foreach ($eventos as $evento) {
            $evento->ativo = false;
            $evento->save();
            $this->info("Evento Id $evento->id inativado}");
            $total++;
        }

        $this->info("Total de eventos inativados: $total");
    }
}
