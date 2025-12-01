<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * If you really want to stop sending the XSRF-TOKEN cookie,
     * set this to false. (Optional)
     */
    // protected $addHttpCookie = false;

    /**
     * Handle an incoming request.
     */
    public function handle($request, Closure $next)
    {
        // Skip CSRF only for NativePHP desktop requests
        // NativePHP sends this header automatically.
        if ($request->header('X-NativePHP') === 'true') {
            return $next($request);
        }

        // For normal browser requests, use default CSRF protection
        return parent::handle($request, $next);
    }
}
