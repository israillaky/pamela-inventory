<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ActivityLogger
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only log if user is authenticated and method is write
        if (! Auth::check()) {
            return $response;
        }

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $response;
        }

        $route      = $request->route();
        $routeName  = $route?->getName(); // e.g. products.store, brands.update
        $path       = $request->path();

        // Map HTTP methods to generic actions
        $action = match ($request->method()) {
            'POST'   => 'created',
            'PUT', 'PATCH' => 'updated',
            'DELETE' => 'deleted',
            default  => strtolower($request->method()),
        };

        $module = 'system';

        if ($routeName && str_contains($routeName, '.')) {
            $module = Str::before($routeName, '.'); // products, brands, categories, stock-in, etc.
        }

        // Special case: login
        if ($routeName === 'login' && $request->isMethod('post')) {
            $action = 'login';
            $module = 'users';
        }

        // Strip sensitive fields
        $payload = $request->except([
            'password',
            'password_confirmation',
            'current_password',
            '_token',
        ]);

        // Avoid logging empty / unknown routes
        if ($routeName || $path) {
            AuditLog::create([
                'user_id'    => Auth::id(),
                'action'     => $action,
                'module'     => $module,
                'description'=> json_encode([
                    'route'   => $routeName,
                    'path'    => $path,
                    'payload' => $payload,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => (string) $request->userAgent(),
            ]);
        }

        return $response;
    }
}
