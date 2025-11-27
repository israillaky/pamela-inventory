<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StockOut;

class StockOutSeeder extends Seeder
{
    public function run(): void
    {
        StockOut::create([
            'product_id' => 1,
            'quantity' => 2,
            'note' => 'Sold 2 dresses',
            'created_by' => 1,
        ]);

        StockOut::create([
            'product_id' => 4,
            'quantity' => 1,
            'note' => 'Sold 1 pair of sneakers',
            'created_by' => 1,
        ]);
    }
}
