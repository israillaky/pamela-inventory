<?php

namespace App\Policies;

use App\Models\User;
use App\Models\StockIn;

class StockInPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin','staff','warehouse_manager','warehouse_staff'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin','warehouse_manager','warehouse_staff'], true);
    }

    public function delete(User $user, StockIn $stockIn): bool
    {
        return in_array($user->role, ['admin','warehouse_manager','warehouse_staff'], true);
    }
}
