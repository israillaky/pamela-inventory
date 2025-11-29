<?php

namespace App\Providers;

use App\Support\PamelaNetwork;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Native\Desktop\Facades\Settings as NativeSettings;

class AppServiceProvider extends ServiceProvider
{
    /**
     * NOTE: This $policies array only has effect in AuthServiceProvider.
     * It is harmless here but not used. Recommended: move to AuthServiceProvider.
     */
    protected $policies = [
        \App\Models\Product::class => \App\Policies\ProductPolicy::class,
        \App\Models\StockIn::class => \App\Policies\StockInPolicy::class,
        \App\Models\StockOut::class => \App\Policies\StockOutPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Your existing boot config
        Vite::prefetch(concurrency: 3);
        Schema::defaultStringLength(191);
    }
}
