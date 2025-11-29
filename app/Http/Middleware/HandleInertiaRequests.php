<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\SettingsService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            // Auth user
            'auth' => [
                'user' => $request->user()
                    ? $request->user()->only('id', 'name', 'username', 'role')
                    : null,
            ],

            // Global settings (normalized)
            'settings' => function () {
                /** @var \App\Services\SettingsService $service */
                $service = app(SettingsService::class);

                $settings = $service->all();

                $rawLogo = $settings['company_logo'] ?? null;

                // Fallback default logo in /public/assets/logo/
                $defaultLogo = asset('assets/logo/pamelas-logo.png');

                $logoUrl = $defaultLogo;

                if ($rawLogo) {
                    // if already a full URL (old system)
                    if (str_starts_with($rawLogo, 'http')) {
                        $logoUrl = $rawLogo;
                    } else {
                        // new system: stored path "logos/xxx.png"
                        $logoUrl = asset('storage/' . ltrim($rawLogo, '/'));
                    }
                }

                return [
                    'company_name' => $settings['company_name'] ?? 'Pamela\'s Online Shop',
                    'company_logo' => $logoUrl,
                ];
            },
        ];
    }
}
