<?php

namespace App\Policies;

use App\Models\User;
use App\Models\StockOut;

class StockOutPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin','staff','warehouse_manager','cashier','warehouse_staff'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin','warehouse_manager','cashier','warehouse_staff'], true);
    }

    public function delete(User $user, StockOut $stockOut): bool
    {
        return in_array($user->role, ['admin','warehouse_manager','warehouse_staff'], true);
    }
}
