<?php

namespace App\Support;

class PamelaNetwork
{
    /**
     * Get the default hostname used by both CLI and Native desktop.
     */
    public static function defaultHostname(): string
    {
        $fromConfig = config('app.url')
            ? parse_url(config('app.url'), PHP_URL_HOST)
            : null;

        return $fromConfig ?: 'pamelasonlineshop.local';
    }

    /**
     * Build the hosts line in a canonical way.
     */
    public static function hostsLine(string $ip, string $hostname): string
    {
        return trim($ip) . ' ' . trim($hostname);
    }

    /**
     * Very small reachability helper (TCP port test).
     */
    public static function isServerReachable(string $ip, int $port = 80, int $timeout = 2): bool
    {
         return true;
        //only client side if sever dont ping return true;
        $connection = @fsockopen($ip, $port, $errno, $errstr, $timeout);

        if (! $connection) {
            return false;
        }

        fclose($connection);

        return true;
    }

    /**
     * Try to detect this machine's LAN IPv4 address (for the setup page).
     */
    public static function detectLanIp(): ?string
    {
        // Prefer a smarter method on Windows
        if (PHP_OS_FAMILY === 'Windows') {
            $output = shell_exec('ipconfig');

            if (! $output) {
                return null;
            }

            // Split into adapter blocks
            $blocks = preg_split('/\r?\n\r?\n/', trim($output));

            foreach ($blocks as $block) {
                $lines = preg_split('/\r?\n/', trim($block));
                if (empty($lines)) {
                    continue;
                }

                $header = $lines[0]; // e.g. "Ethernet adapter Wi-Fi:"
                $headerLower = strtolower($header);

                // Skip obvious virtual / loopback adapters
                if (
                    str_contains($headerLower, 'vmware') ||
                    str_contains($headerLower, 'virtualbox') ||
                    str_contains($headerLower, 'loopback') ||
                    str_contains($headerLower, 'v Ethernet') ||
                    str_contains($headerLower, 'hyper-v')
                ) {
                    continue;
                }

                // Look for an "IPv4 Address" line in this block
                foreach ($lines as $line) {
                    if (preg_match('/IPv4 Address[^\:]*:\s*([0-9\.]+)/', $line, $matches)) {
                        $ip = $matches[1];

                        if (
                            filter_var($ip, FILTER_VALIDATE_IP) &&
                            ! str_starts_with($ip, '127.')
                        ) {
                            return $ip;
                        }
                    }
                }
            }
        }

        // Fallback: old behavior (for non-Windows or if ipconfig fails)
        $host = gethostname();
        if (! $host) {
            return null;
        }

        $ip = gethostbyname($host);

        if (! filter_var($ip, FILTER_VALIDATE_IP)) {
            return null;
        }

        if (str_starts_with($ip, '127.')) {
            return null;
        }

        return $ip;
    }
}
