<?php

namespace App\Http\Controllers\Desktop;

use App\Support\PamelaNetwork;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Native\Desktop\Facades\Settings;
use Native\Desktop\Facades\Window;

class ServerSetupController
{
    public function show(Request $request)
    {
        if (! $this->isDesktop()) {
            abort(404);
        }
        $defaultHostname = PamelaNetwork::defaultHostname();

        $hostname = $defaultHostname;
        $ip       = null;

        // Only use Settings in desktop mode
        if ($this->isDesktop()) {
            $hostname = Settings::get('server.hostname', $defaultHostname);
            $ip       = Settings::get('server.ip');
        }

         return Inertia::render('Native/ServerSetup', [
            'currentHostname' => $hostname,
            'currentIp'       => $ip,
            'detectedIp'      => PamelaNetwork::detectLanIp(), // <— here
            'isDesktop'       => $this->isDesktop(),
            'errors'          => session('errors') ? session('errors')->toArray() : (object) [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hostname' => ['required', 'string'],
            'ip'       => ['required', 'ip'],
        ]);

        if (PHP_OS_FAMILY !== 'Windows') {
            return back()->withErrors([
                'ip' => 'Automatic hosts update is only supported on Windows. ' .
                        'Please update your hosts file manually.',
            ]);
        }

        try {
            $this->updateWindowsHosts($data['ip'], $data['hostname']);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'ip' => 'Failed to update hosts file. Please run the app as Administrator ' .
                        'or update the hosts file manually.',
            ]);
        }

        // Persist in Native settings only in desktop mode
        if ($this->isDesktop()) {
            Settings::set('server.hostname', $data['hostname']);
            Settings::set('server.ip', $data['ip']);
        }

        // Ensure the main window uses this URL
        config()->set('app.url', 'http://' . $data['hostname']);

        if ($this->isDesktop()) {
            // Build same title pattern as in ServerBootstrap
            $title = 'Pamela Inventory';
            $title .= " — Connected to {$data['ip']} ({$data['hostname']})";

            // Close setup window and open main window with connection title
            Window::get('server-setup')?->close();

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
        }

        return redirect()->route('native.server-setup.show');
    }

    protected function updateWindowsHosts(string $ip, string $hostname): void
    {
        $systemRoot = getenv('SystemRoot') ?: 'C:\Windows';
        $hostsPath  = $systemRoot . DIRECTORY_SEPARATOR . 'System32' .
                      DIRECTORY_SEPARATOR . 'drivers' .
                      DIRECTORY_SEPARATOR . 'etc' .
                      DIRECTORY_SEPARATOR . 'hosts';

        if (! is_writable($hostsPath)) {
            throw new \RuntimeException("Hosts file is not writable: {$hostsPath}");
        }

        $contents = file_get_contents($hostsPath);
        if ($contents === false) {
            throw new \RuntimeException('Unable to read hosts file');
        }

        $lines = preg_split('/\R/', $contents);

        $filtered = [];
        foreach ($lines as $line) {
            if (preg_match('/\s' . preg_quote($hostname, '/') . '(\s|$)/', $line)) {
                continue;
            }
            $filtered[] = $line;
        }

        $filtered[] = PamelaNetwork::hostsLine($ip, $hostname);

        $newContents = implode(PHP_EOL, $filtered) . PHP_EOL;

        if (file_put_contents($hostsPath, $newContents) === false) {
            throw new \RuntimeException('Unable to write hosts file');
        }
    }

    /**
     * Only true when running as a NativePHP desktop app.
     */
    protected function isDesktop(): bool
    {
        return (bool) env('NATIVEPHP_APP_ID');
    }
}
