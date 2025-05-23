<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\LdapService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\Ldap\Ldap;

class LdapController extends Controller
{
    private $ldapService;

    public function __construct(LdapService $ldapService) {
        $this->ldapService = $ldapService;
    }

    public function login(Request $request)
    {
        $username = $request->input("username");
        $password = $request->input("password");

        $ldapUsers = $this->ldapService->obterTodosUsersLdap();
        $userFound = false;

        foreach ($ldapUsers as $ldapUser) {
            if ($ldapUser['sAMAccountName'] === $username) {
                $cn = $ldapUser['cn'];
                $description = $ldapUser['description'];
                $userFound = true;
                break;
            }
        }
        if (!$userFound) {
            return redirect()->back()->withErrors(['login_error' => 'Usuário e ou senha incorretos']);
        }

        // Tenta autenticar no LDAP
        try {
            $dn = "CN={$cn},OU=Florianópolis - Sede,OU=Usuários,OU=COREN-SC,DC=coren,DC=local";
            $ldap = Ldap::create('ext_ldap', ['host' => '192.168.1.17']);
            $ldap->bind($dn, $password);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['login_error' => 'Usuário e ou senha incorretos']);
        }

        $user = User::where('username', $username)->first();

        if (!$user) {
            $user = new User();
            $user->username = $username;
            $user->ativo = true;
            $user->nome = $cn;
            $user->departamento = $description;
            $user->save();
        }

        if (!$user->pode_acessar) {
            return redirect()->back()->withErrors(['login_error' => 'Seu acesso ainda não foi liberado pelo administrador.']);
        }

        if ($user->role === 'padrao') {
            return redirect()->back()->withErrors(['login_error' => 'Por padrão o seu usuário não pode acessar o sistema.']);
        }

        Auth::login($user);

        switch ($user->role) {
            case 'admin':
                return redirect()->route('dashboard');

            case 'visualizador':
                return redirect()->route('visualizadorEventos');

            default:
                return redirect()->back()->withErrors(['login_error' => 'Por padrão o seu usuário não pode acessar o sistema.']);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->intended('login');
    }

}
