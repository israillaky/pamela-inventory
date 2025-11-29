<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class CustomVerifyCsrf extends BaseVerifier
{
    /**
     * URIs that should be excluded from CSRF verification.
     */
    protected $except = [
        'native/server-setup',
    ];
}
