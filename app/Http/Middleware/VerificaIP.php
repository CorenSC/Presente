<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificaIP
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ipPermitido = ['168.181.70.250', '127.0.0.1'];
        if (!in_array($request->ip(), $ipPermitido)) {
            abort(403, 'Acesso não autorizado!');
        }

        return $next($request);
    }
}
