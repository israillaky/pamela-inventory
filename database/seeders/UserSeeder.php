<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'name' => 'Admin',
                'username' => 'admin',
                'email' => 'admin@pamelainventory.test',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ],
            [
                'name' => 'Staff',
                'username' => 'staff',
                'email' => 'staff@pamelainventory.test',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ],
            [
                'name' => 'Warehouse Manager',
                'username' => 'warehouse',
                'email' => 'warehouse@pamelainventory.test',
                'password' => Hash::make('password'),
                'role' => 'warehouse_manager',
            ],
            [
                'name' => 'Warehouse Staff',
                'username' => 'warehouse_staff',
                'email' => 'warehousestaff@pamelainventory.test',
                'password' => Hash::make('password'),
                'role' => 'warehouse_staff',
            ],
            [
                'name' => 'Cashier',
                'username' => 'cashier',
                'email' => 'cashier@pamelainventory.test',
                'password' => Hash::make('password'),
                'role' => 'cashier',
            ],
        ];

        foreach ($defaults as $u) {
            User::updateOrCreate(
                ['username' => $u['username']],
                $u
            );
        }
    }
}
