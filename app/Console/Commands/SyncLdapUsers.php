<?php

namespace App\Console\Commands;

use App\Services\LdapService;
use Illuminate\Console\Command;

class SyncLdapUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ldap:sync-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincroniza usuários do LDAP com o banco de dados';

    protected $ldapService;

    public function __construct(
        LdapService $ldapService
    )
    {
        parent::__construct();
        $this->ldapService = $ldapService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando sincronização do LDAP');
        $this->ldapService->popularBancoComUsuariosLdap();
        $this->info('Sincronizado!');
    }
}
