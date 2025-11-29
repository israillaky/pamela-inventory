<?php

namespace App\Console\Commands;

use App\Support\PamelaNetwork;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ConfigureLanEnvironment extends Command
{
    /**
     * pamela:lan-setup
     *
     * Examples:
     *  php artisan pamela:lan-setup
     *  php artisan pamela:lan-setup pamelasonlineshop.local
     *  php artisan pamela:lan-setup pamelasonlineshop.local --ip=192.168.254.181 --force
     */
    protected $signature = 'pamela:lan-setup
        {hostname? : Hostname to use, e.g. pamelasonlineshop.local}
        {--ip= : Override detected LAN IP}
        {--no-env : Do not modify the .env file}
        {--no-vhost : Do not generate Apache vhost snippet}
        {--force : Run without interactive confirmations}';

    protected $description = 'Configure LAN settings (.env, Apache vhost, hosts helper) for pamela-inventory on WAMP';

    public function handle(): int
    {
        $this->info('=== Pamela Inventory LAN Setup ===');

        // 1. Resolve hostname (shared with NativePHP via PamelaNetwork)
        $defaultHostname = PamelaNetwork::defaultHostname();
        $hostname = $this->argument('hostname') ?: $defaultHostname;

        $this->line('Using hostname: <info>' . $hostname . '</info>');

        // 2. Detect / resolve LAN IP
        $overrideIp = $this->option('ip');
        $lanIp = $overrideIp ?: $this->detectLanIp();

        if (! $lanIp) {
            $this->error('Unable to detect LAN IP. Use --ip=192.168.x.x to override.');
            return self::FAILURE;
        }

        $this->line('Detected LAN IP: <info>' . $lanIp . '</info>');

        $force = (bool) $this->option('force');

        // 3. Update .env
        if (! $this->option('no-env')) {
            if (! $force && ! $this->confirm('Update .env with LAN-friendly settings for this hostname?', true)) {
                $this->warn('Skipping .env update.');
            } else {
                $this->updateEnvFile($hostname);
            }
        } else {
            $this->warn('Skipping .env update because --no-env was provided.');
        }

        // 4. Generate Apache vhost snippet
        $vhostPath = null;
        if (! $this->option('no-vhost')) {
            if (! $force && ! $this->confirm('Generate Apache vhost snippet file under storage/app/apache/?', true)) {
                $this->warn('Skipping vhost generation.');
            } else {
                $vhostPath = $this->generateVhostFile($hostname);
            }
        } else {
            $this->warn('Skipping vhost generation because --no-vhost was provided.');
        }

        // 5. Print hosts helper lines (shared format with NativePHP desktop)
        $this->printHostsHelper($lanIp, $hostname);

        // 6. Apache next steps
        if ($vhostPath) {
            $this->printApacheNextSteps($vhostPath);
        }

        // 7. Summary
        $this->info('LAN setup summary:');
        $this->line(' APP_URL      = http://' . $hostname);
        $this->line(' LAN IP       = ' . $lanIp);
        $this->line(' Hostname     = ' . $hostname);
        if ($vhostPath) {
            $this->line(' VHost file   = ' . $vhostPath);
        }

        $this->newLine();
        $this->info('Done. Remember to restart Apache after updating httpd-vhosts.conf.');

        return self::SUCCESS;
    }

    /**
     * Try to detect the LAN IP of this machine.
     */
    protected function detectLanIp(): ?string
    {
        // Use a UDP socket trick to find the active local IP
        try {
            $socket = @socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
            if ($socket === false) {
                return null;
            }

            // We never actually send anything; we just use this to get the local endpoint
            @socket_connect($socket, '8.8.8.8', 80);
            @socket_getsockname($socket, $addr);
            @socket_close($socket);

            if (! empty($addr) && filter_var($addr, FILTER_VALIDATE_IP)) {
                return $addr;
            }
        } catch (\Throwable $e) {
            // Ignore and fall back
        }

        // Fallback: hostname lookup
        $fallback = gethostbyname(gethostname());
        return filter_var($fallback, FILTER_VALIDATE_IP) ? $fallback : null;
    }

    /**
     * Update the .env file with APP_URL, SESSION_DOMAIN, SANCTUM_STATEFUL_DOMAINS.
     */
    protected function updateEnvFile(string $hostname): void
    {
        $envPath = base_path('.env');

        if (! File::exists($envPath)) {
            $this->error('.env file not found at: ' . $envPath);
            return;
        }

        $envContent = File::get($envPath);

        // Backup first
        $backupPath = $envPath . '.backup-' . now()->format('YmdHis');
        File::put($backupPath, $envContent);
        $this->info('Backup created: ' . $backupPath);

        $envContent = $this->setEnvValue($envContent, 'APP_URL', 'http://' . $hostname);

        // Session + Sanctum domains are safe to set for LAN
        $envContent = $this->setEnvValue($envContent, 'SESSION_DOMAIN', $hostname);

        // Add localhost and 127.0.0.1 for dev/native app, plus the LAN hostname
        $stateful = $hostname . ',localhost,127.0.0.1';
        $envContent = $this->setEnvValue($envContent, 'SANCTUM_STATEFUL_DOMAINS', $stateful);

        File::put($envPath, $envContent);

        $this->info('.env updated successfully:');
        $this->line('  APP_URL=http://' . $hostname);
        $this->line('  SESSION_DOMAIN=' . $hostname);
        $this->line('  SANCTUM_STATEFUL_DOMAINS=' . $stateful);
        $this->line('You may want to run: php artisan config:clear');
    }

    /**
     * Set or append a key=value pair in .env content.
     */
    protected function setEnvValue(string $envContent, string $key, string $value): string
    {
        $pattern = '/^' . preg_quote($key, '/') . '=.*/m';

        if (preg_match($pattern, $envContent)) {
            // Replace existing line
            return preg_replace($pattern, $key . '=' . $value, $envContent);
        }

        // Append new line
        $envContent = rtrim($envContent, "\r\n") . PHP_EOL;
        return $envContent . $key . '=' . $value . PHP_EOL;
    }

    /**
     * Generate Apache vhost file under storage/app/apache.
     */
    protected function generateVhostFile(string $hostname): ?string
    {
        $storageDir = storage_path('app/apache');
        if (! File::isDirectory($storageDir)) {
            File::makeDirectory($storageDir, 0755, true);
        }

        $publicPath = realpath(public_path()) ?: public_path();

        // Apache prefers forward slashes, even on Windows
        $publicPathNormalized = str_replace('\\', '/', $publicPath);

        $vhostContent = <<<CONF
# Auto-generated virtual host for {$hostname}
<VirtualHost *:80>
    ServerName {$hostname}
    DocumentRoot "{$publicPathNormalized}"

    <Directory "{$publicPathNormalized}">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog "logs/{$hostname}-error.log"
    CustomLog "logs/{$hostname}-access.log" common
</VirtualHost>

CONF;

        $fileName = 'vhost-' . $hostname . '.conf';
        $filePath = $storageDir . DIRECTORY_SEPARATOR . $fileName;

        File::put($filePath, $vhostContent);

        $this->info('Apache vhost snippet generated: ' . $filePath);

        return $filePath;
    }

    /**
     * Print sample hosts entries for server and clients.
     */
    protected function printHostsHelper(string $lanIp, string $hostname): void
    {
        $hostsLine = PamelaNetwork::hostsLine($lanIp, $hostname);

        $this->newLine();
        $this->info('=== Hosts file entries (copy to client machines) ===');
        $this->line('On each client PC, add this line to: C:\Windows\System32\drivers\etc\hosts');
        $this->newLine();
        $this->line('  ' . $hostsLine);
        $this->newLine();
        $this->line('Example:');
        $this->line('  ' . $hostsLine);
        $this->newLine();
    }

    /**
     * Explain how to include the vhost file into WAMP's httpd-vhosts.conf.
     */
    protected function printApacheNextSteps(string $vhostPath): void
    {
        $this->newLine();
        $this->info('=== Apache Next Steps (WAMP) ===');
        $this->line('1. Open WAMP Apache vhosts config, e.g.:');
        $this->line('   F:\\wamp64\\bin\\apache\\apacheX.Y.Z\\conf\\extra\\httpd-vhosts.conf');
        $this->line('   (Adjust X.Y.Z to your actual Apache version.)');
        $this->newLine();
        $this->line('2. At the bottom, include the generated file, e.g.:');
        $this->newLine();
        $this->line('   Include "' . str_replace('\\', '/', $vhostPath) . '"');
        $this->newLine();
        $this->line('3. Restart all WAMP services (or at least Apache).');
        $this->newLine();
    }
}
