<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Inertia\Inertia;

class DashboardController extends Controller
{

    public function index()
    {
        $evento = Evento::all();

        return Inertia::render('dashboard', ['eventos' => $evento]);
    }


}
