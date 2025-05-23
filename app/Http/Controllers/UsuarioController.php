<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use App\Models\User;

class UsuarioController extends Controller
{
    public function index()
    {
        $usuarios = User::orderBy('nome')->get();

        return Inertia::render('usuarios/index', [
            'usuarios' => $usuarios,
            'flash' => [
                'success' => Session::get('success'),
            ],
        ]);
    }

    public function atualizar(Request $request, User $user)
    {

        $validated = $request->validate([
            'role' => 'required|string',
            'pode_acessar' => 'required|boolean',
        ]);

        if ($validated['role'] !== 'padrao' && !$validated['pode_acessar']) {
            return back()->withErrors([
                'pode_acessar' => 'Usuários com perfil "Administrador" ou "Visualizador" devem ter acesso ao sistema.',
            ])->withInput();
        }

        $user->update([
            'role' => $request->role,
            'pode_acessar' => $request->pode_acessar,
        ]);

        return redirect()->route('usuarios')->with('success', 'Usuário atualizado.');
    }

    public function visualizadorEventos() {
        $eventos = Evento::all();
        return Inertia::render('usuarios/visualizador/index', [
            'eventos' => $eventos,
        ]);
    }
}
