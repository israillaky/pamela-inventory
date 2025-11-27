<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StockIn;

class StockInSeeder extends Seeder
{
    public function run(): void
    {
        StockIn::create([
            'product_id' => 1,
            'quantity' => 20,
            'note' => 'Initial stock - Dresses',
            'created_by' => 1,
        ]);

        StockIn::create([
            'product_id' => 2,
            'quantity' => 15,
            'note' => 'Initial stock - Polo',
            'created_by' => 1,
        ]);

        StockIn::create([
            'product_id' => 3,
            'quantity' => 10,
            'note' => 'Initial stock - Bags',
            'created_by' => 1,
        ]);

        StockIn::create([
            'product_id' => 4,
            'quantity' => 12,
            'note' => 'Initial stock - Sneakers',
            'created_by' => 1,
        ]);
    }
}
