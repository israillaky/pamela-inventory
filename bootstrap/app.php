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
use Throwable;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Console\Scheduling\Schedule;



return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            //'activity.logger' => ActivityLogger::class,
        ]);
        $middleware->appendToGroup('web', [
            ActivityLogger::class,
        ]);

        //
    })
    ->withSchedule(function (Schedule $schedule) {
        // Run every night at 2 AM
        $schedule->command('audit-logs:prune')->dailyAt('09:00');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        /**
         * 1) AUTHENTICATION (401 / redirect to login)
         */
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! $e instanceof AuthenticationException) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->guest(route('login'));
        });

        /**
         * 2) AUTHORIZATION (403 Forbidden)
         */
        $exceptions->render(function (\Throwable $e, Request $request) {
            $isAuthorizationException = $e instanceof AuthorizationException;
            $isHttp403 = $e instanceof HttpExceptionInterface && $e->getStatusCode() === 403;

            // Only handle real 403s (AuthorizationException or abort(403))
            if (! $isAuthorizationException && ! $isHttp403) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'You are not allowed to perform this action.'], 403);
            }

            if ($request->header('X-Inertia')) {
                return Inertia::render('Error/Forbidden', [
                    'message' => 'You are not allowed to perform this action.',
                ])->toResponse($request)->setStatusCode(403);
            }

            return response()->view(
                'errors.generic',
                ['message' => 'You are not allowed to perform this action.'],
                403
            );
        });

        /**
         * 3) VALIDATION (422)
         *
         * Usually Laravel + Inertia already handle this for web forms,
         * but we normalize JSON responses and avoid touching Inertia behaviour.
         */
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! $e instanceof ValidationException) {
                return null;
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors'  => $e->errors(),
                ], 422);
            }

            // For web/Inertia, let Laravel keep the default (redirect back with errors)
            return null;
        });

        /**
         * 4) NOT FOUND (404)
         */
        $exceptions->render(function (\Throwable $e, Request $request) {
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

        /**
         * 5) GENERIC SYSTEM ERROR (500) + POPUP
         *
         * Only used when APP_DEBUG=false.
         */
        $exceptions->render(function (\Throwable $e, Request $request) {
            // In debug, let Laravel show the detailed error page
            if (config('app.debug')) {
                return null;
            }

            // JSON / API
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Something went wrong with the system. Please contact your developer.',
                ], 500);
            }

            // Inertia (React) requests → show System error popup page
            if ($request->header('X-Inertia')) {
                return Inertia::render('Error/System', [
                    'message' => 'Something went wrong with the system. Please contact your developer.',
                ])->toResponse($request)->setStatusCode(500);
            }

            // Fallback for non-Inertia web
            return response()->view(
                'errors.generic',
                ['message' => 'Something went wrong with the system. Please contact your developer.'],
                500
            );
        });

        /**
         * 6) REPORTING: log unexpected errors into audit_logs
         */
        $exceptions->report(function (\Throwable $e) {
            // Skip DB logging in local to avoid noise
            if (app()->environment('local')) {
                return;
            }

            // Do not log "noise" exceptions as system errors
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
                // never let logging break the app
            }
        });

    })->create();
