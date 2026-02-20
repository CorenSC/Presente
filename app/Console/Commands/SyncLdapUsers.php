<?php

namespace App\Console\Commands;

use App\Models\User;
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

        // ✅ FORÇA matheus.luz como admin com acesso
        $user = User::where('username', 'matheus.luz')->first();

        if ($user) {
            $user->update([
                'pode_acessar' => true,
                'role' => 'admin',
            ]);

            $this->info('Usuário matheus.luz definido como admin com acesso liberado.');
        } else {
            $this->warn('Usuário matheus.luz não encontrado após sincronização.');
        }

        $this->info('Sincronizado!');
    }
}