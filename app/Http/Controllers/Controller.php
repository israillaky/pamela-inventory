<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Throwable;


abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Shared exception handler for ALL controllers.
     *
     * Usage in any controller method:
     *
     *   public function index(Request $request)
     *   {
     *       try {
     *           // your normal logic...
     *       } catch (Throwable $e) {
     *           return $this->handleException($request, $e, 'Friendly message here');
     *       }
     *   }
     */
    protected function handleException(
        Request $request,
        Throwable $e,
        string $fallbackMessage = 'Something went wrong.'
    ) {
        // Do not hide real 403 permission errors
        if ($e instanceof AuthorizationException) {
            throw $e;
        }

        // Log full error details for debugging (NativePHP + web)
        Log::error('Controller exception', [
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
            'user_id' => Auth::id(),
            'url'     => $request->fullUrl(),
            'method'  => $request->method(),
            'trace'   => $e->getTraceAsString(),
        ]);

        // If the request expects JSON (API / Axios / Inertia XHR)
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $fallbackMessage,
            ], 500);
        }

        // Normal web / Inertia: redirect back with error flash
        return redirect()
            ->back()
            ->withInput($request->except(['password', 'password_confirmation']))
            ->with('error', $fallbackMessage);
    }
}
