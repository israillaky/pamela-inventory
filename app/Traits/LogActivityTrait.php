<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait LogActivityTrait
{
    protected function logActivity(
        string $action,
        string $module,
        string|array|null $description = null
    ): void {
        $user = Auth::user();

        if (! $user) {
            return;
        }

        if (is_array($description)) {
            $description = json_encode($description);
        }

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => $action,
            'module'     => $module,
            'description'=> $description,
            'ip_address' => request()->ip(),
            'user_agent' => (string) request()->userAgent(),
        ]);
    }
}
