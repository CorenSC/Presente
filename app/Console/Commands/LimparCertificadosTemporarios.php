<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class LimparCertificadosTemporarios extends Command
{
    protected $signature = 'certificados:limpar-temporarios';
    protected $description = 'Apaga certificados temporários com mais de 90 dias';

    public function handle()
    {
        $files = Storage::disk('public')->files('certificados_temp');

        $deletedCount = 0;
        foreach ($files as $file) {
            $lastModified = Storage::disk('public')->lastModified($file);
            $fileDate = Carbon::createFromTimestamp($lastModified);

            if ($fileDate->lt(now()->subDays(90))) {
                Storage::disk('public')->delete($file);
                $deletedCount++;
            }
        }

        $this->info("{$deletedCount} arquivos apagados da pasta certificados_temp.");
    }
}
