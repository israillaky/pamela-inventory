<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;



class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // admin only
        abort_unless($user && $user->role === 'admin', 403);

        $filters = $request->only([
            'user_id',
            'action',
            'module',
            'ip_address',
            'from',
            'to',
            'search',
        ]);

        $query = AuditLog::with('user')
            ->when($filters['user_id'] ?? null, fn ($q, $userId) =>
                $q->where('user_id', $userId)
            )
            ->when($filters['action'] ?? null, fn ($q, $action) =>
                $q->where('action', $action)
            )
            ->when($filters['module'] ?? null, fn ($q, $module) =>
                $q->where('module', $module)
            )
            ->when($filters['ip_address'] ?? null, fn ($q, $ip) =>
                $q->where('ip_address', 'like', "%{$ip}%")
            )
            ->when($filters['from'] ?? null, fn ($q, $from) =>
                $q->whereDate('created_at', '>=', $from)
            )
            ->when($filters['to'] ?? null, fn ($q, $to) =>
                $q->whereDate('created_at', '<=', $to)
            )
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at');
        $logs = $request->boolean('no_pagination')
                ? $query->get()                   // plain array
                : $query->paginate(20)->withQueryString(); // paginator

        return Inertia::render('AuditLogs/Index', [
            'logs'     => $logs,
            'filters'  => $filters,
            'users'    => User::select('id', 'name')->orderBy('name')->get(),
            'actions'  => ['created', 'updated', 'deleted', 'login', 'stock_in', 'stock_out'],
            'modules'  => ['products', 'brands', 'categories', 'stock_in', 'stock_out', 'users', 'reports'],
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'admin', 403);

        // reuse same filters
        $filters = $request->only([
            'user_id',
            'action',
            'module',
            'ip_address',
            'from',
            'to',
            'search',
        ]);

        $query = AuditLog::with('user')
            ->when($filters['user_id'] ?? null, fn ($q, $userId) =>
                $q->where('user_id', $userId)
            )
            ->when($filters['action'] ?? null, fn ($q, $action) =>
                $q->where('action', $action)
            )
            ->when($filters['module'] ?? null, fn ($q, $module) =>
                $q->where('module', $module)
            )
            ->when($filters['ip_address'] ?? null, fn ($q, $ip) =>
                $q->where('ip_address', 'like', "%{$ip}%")
            )
            ->when($filters['from'] ?? null, fn ($q, $from) =>
                $q->whereDate('created_at', '>=', $from)
            )
            ->when($filters['to'] ?? null, fn ($q, $to) =>
                $q->whereDate('created_at', '<=', $to)
            )
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at');

        $filename = 'audit_logs_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Date',
                'User',
                'Role',
                'Action',
                'Module',
                'Description',
                'IP Address',
                'User Agent',
            ]);

            $query->chunk(500, function ($rows) use ($handle) {
                foreach ($rows as $log) {
                    fputcsv($handle, [
                        $log->created_at,
                        optional($log->user)->name,
                        optional($log->user)->role,
                        $log->action,
                        $log->module,
                        $log->description,
                        $log->ip_address,
                        $log->user_agent,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

}
