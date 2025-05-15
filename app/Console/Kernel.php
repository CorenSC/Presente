<?php

namespace App\Console;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Console\Scheduling\Schedule;

class Kernel extends ConsoleKernel
{

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
    }

    protected function schedule(Schedule $schedule)
    {
        $schedule->command('eventos:inativar-expirados')->dailyAt('00:00');
        $schedule->command('ldap:sync-users')->everyTwoHours();
    }

}
