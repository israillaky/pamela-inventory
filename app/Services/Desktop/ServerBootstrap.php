<?php

namespace App\Services\Desktop;

use App\Support\PamelaNetwork;
use Native\Desktop\Facades\Settings;
use Native\Desktop\Facades\Window;

class ServerBootstrap
{
    public function boot(): void
    {
        if (! $this->runningOnDesktop()) {
            return;
        }

        $defaultHostname = PamelaNetwork::defaultHostname();

        $hostname = Settings::get('server.hostname', $defaultHostname);
        $ip       = Settings::get('server.ip'); // may be null on first run

        $title = "Pamela Inventory";

        if ($ip && $hostname) {
            $title .= " — Connected to {$ip} ({$hostname})";
        }

        if ($ip && PamelaNetwork::isServerReachable($ip, 80)) {
            config()->set('app.url', 'http://' . $hostname);

             Window::open('main')
                ->title(config('app.name', $title))
                ->url(config('app.url'))
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

            return;
        }

        // If unreachable or no IP: show setup window
        Window::open('server-setup')
            ->title('Server Connection Setup')
            ->width(1920)
            ->height(1080)
            ->minWidth(1024)
            ->minHeight(600)
            ->hideMenu()
            ->maximizable(true)
            ->minimizable(true)
            ->closable(true)
            ->resizable(true)
            ->route('native.server-setup.show');
    }

    protected function runningOnDesktop(): bool
    {
        // Only when running as a NativePHP desktop app
        return (bool) env('NATIVEPHP_APP_ID');
    }
}
