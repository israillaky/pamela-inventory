<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Console\Command;

class PruneAuditLogs extends Command
{
    protected $signature = 'audit-logs:prune';
    protected $description = 'Delete audit logs older than 5 months';

    public function handle(): int
    {
        $cutoff = Carbon::now()->subDays(90);

        $deleted = AuditLog::where('created_at', '<', $cutoff)->delete();

        $this->info("Pruned {$deleted} audit log records older than {$cutoff->toDateString()}.");

        return self::SUCCESS;
    }
}
