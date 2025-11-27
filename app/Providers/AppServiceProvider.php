<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    protected $policies = [
        \App\Models\Product::class => \App\Policies\ProductPolicy::class,
        \App\Models\StockIn::class => \App\Policies\StockInPolicy::class,
        \App\Models\StockOut::class => \App\Policies\StockOutPolicy::class,
    ];


    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Schema::defaultStringLength(191);

    }
}
