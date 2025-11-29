<?php

namespace App\Providers;

use Native\Desktop\Facades\Window;
use Native\Desktop\Contracts\ProvidesPhpIni;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {

        $baseUrl = rtrim(config('app.url'), '/');   // uses APP_URL value

        Window::open('main')
            ->title(config('app.name', 'Pamela Inventory'))
            ->url($baseUrl . '/dashboard')  // or your WAMP URL, e.g.
            ->width(1920)       // 🔥 full available screen width
            ->height(1080)      // 🔥 full available screen height
            ->minWidth(1024)
            ->minHeight(600)
            ->rememberState()
            ->hideMenu()
            ->maximizable(true)
            ->minimizable(true)
            ->closable(true)
            ->resizable(true);
    }

    /**
     * Return an array of php.ini directives to be set.
     */
    public function phpIni(): array
    {
        return [
            'memory_limit' => '512M',
            'display_errors' => '1',
            'error_reporting' => 'E_ALL',
            'max_execution_time' => '0',
            'max_input_time' => '0',
        ];
    }
}
