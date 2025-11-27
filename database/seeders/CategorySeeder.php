<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::create(['name' => 'Women', 'created_by' => 1]);
        Category::create(['name' => 'Men', 'created_by' => 1]);
        Category::create(['name' => 'Accessories', 'created_by' => 1]);
        Category::create(['name' => 'Footwear', 'created_by' => 1]);
    }
}
