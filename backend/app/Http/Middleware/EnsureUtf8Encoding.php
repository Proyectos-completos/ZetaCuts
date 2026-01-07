<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUtf8Encoding
{

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }
}
