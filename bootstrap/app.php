<?php

use App\Models\AuditLog;
use App\Http\Middleware\ActivityLogger;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))

    /*
    |--------------------------------------------------------------------------
    | Routing
    |--------------------------------------------------------------------------
    */
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )


    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    */
    ->withMiddleware(function (Middleware $middleware) {

        // Web middleware group additions
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);

        // Add activity logger to web requests
        $middleware->appendToGroup('web', [
            ActivityLogger::class,
        ]);


    })

    /*
    |--------------------------------------------------------------------------
    | Scheduler
    |--------------------------------------------------------------------------
    */
    ->withSchedule(function (Schedule $schedule) {
        // prune audit_logs every day at 9 AM
        $schedule->command('audit-logs:prune')->dailyAt('09:00');
    })

    /*
    |--------------------------------------------------------------------------
    | Exception Handling
    |--------------------------------------------------------------------------
    */
    ->withExceptions(function (Exceptions $exceptions) {

        /*
        |--------------------------------------------------------------------------
        | 1. Authentication Exception (401)
        |--------------------------------------------------------------------------
        */
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $e instanceof AuthenticationException) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->guest(route('login'));
        });

        /*
        |--------------------------------------------------------------------------
        | 2. Authorization Exception (403)
        |--------------------------------------------------------------------------
        */
        $exceptions->render(function (Throwable $e, Request $request) {
            $isAuthz = $e instanceof AuthorizationException;
            $is403 = $e instanceof HttpExceptionInterface && $e->getStatusCode() === 403;

            if (! $isAuthz && ! $is403) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You are not allowed to perform this action.'
                ], 403);
            }

            // Inertia requests
            if ($request->header('X-Inertia')) {
                return Inertia::render('Error/Forbidden', [
                    'message' => 'You are not allowed to perform this action.',
                ])->toResponse($request)->setStatusCode(403);
            }

            // Blade fallback
            return response()->view(
                'errors.generic',
                ['message' => 'You are not allowed to perform this action.'],
                403
            );
        });

        /*
        |--------------------------------------------------------------------------
        | 3. Validation Exception (422)
        |--------------------------------------------------------------------------
        */
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $e instanceof ValidationException) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors'  => $e->errors(),
                ], 422);
            }

            return null; // use Laravel's default Inertia redirect back
        });

        /*
        |--------------------------------------------------------------------------
        | 4. Not Found Exception (404)
        |--------------------------------------------------------------------------
        */
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $e instanceof NotFoundHttpException) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Resource not found.'], 404);
            }

            if ($request->header('X-Inertia')) {
                return Inertia::render('Error/NotFound', [
                    'message' => 'The page you are looking for could not be found.',
                ])->toResponse($request)->setStatusCode(404);
            }

            return response()->view(
                'errors.generic',
                ['message' => 'The page you are looking for could not be found.'],
                404
            );
        });

        /*
        |--------------------------------------------------------------------------
        | 5. Generic System Error (500)
        |--------------------------------------------------------------------------
        */
        $exceptions->render(function (Throwable $e, Request $request) {

            // If debugging → use Laravel's Whoops screen
            if (config('app.debug')) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' =>
                        'Something went wrong with the system. Please contact your developer.',
                ], 500);
            }

            if ($request->header('X-Inertia')) {
                return Inertia::render('Error/System', [
                    'message' =>
                        'Something went wrong with the system. Please contact your developer.',
                ])->toResponse($request)->setStatusCode(500);
            }

            // Blade fallback
            return response()->view(
                'errors.generic',
                ['message' =>
                    'Something went wrong with the system. Please contact your developer.'
                ],
                500
            );
        });

        /*
        |--------------------------------------------------------------------------
        | 6. Error Reporting → Log into audit_logs (non-debug & non-noise cases)
        |--------------------------------------------------------------------------
        */
        $exceptions->report(function (Throwable $e) {

            // Skip recording in local environment
            if (app()->environment('local')) {
                return;
            }

            // Skip noise exceptions
            if (
                $e instanceof AuthenticationException ||
                $e instanceof AuthorizationException ||
                $e instanceof ValidationException ||
                $e instanceof NotFoundHttpException
            ) {
                return;
            }

            try {
                $user = Auth::user();

                AuditLog::create([
                    'user_id'    => $user?->id,
                    'action'     => 'error',
                    'module'     => 'system',
                    'description'=> substr($e->getMessage(), 0, 500),
                    'ip_address' => request()->ip(),
                    'user_agent' => (string) request()->userAgent(),
                ]);
            } catch (Throwable $inner) {
                // Never allow reporting failure to break app
            }
        });
    })
    ->withCommands([
        \App\Console\Commands\ConfigureLanEnvironment::class,
        \App\Console\Commands\PruneAuditLogs::class,
    ])

    ->create();
