<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChildCategory;

class ChildCategorySeeder extends Seeder
{
    public function run(): void
    {
        // WOMEN
        ChildCategory::create(['category_id' => 1, 'name' => 'Dresses', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 1, 'name' => 'Tops', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 1, 'name' => 'Skirts', 'created_by' => 1]);

        // MEN
        ChildCategory::create(['category_id' => 2, 'name' => 'Shirts', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 2, 'name' => 'Pants', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 2, 'name' => 'Jackets', 'created_by' => 1]);

        // ACCESSORIES
        ChildCategory::create(['category_id' => 3, 'name' => 'Bags', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 3, 'name' => 'Jewelry', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 3, 'name' => 'Belts', 'created_by' => 1]);

        // FOOTWEAR
        ChildCategory::create(['category_id' => 4, 'name' => 'Sneakers', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 4, 'name' => 'Heels', 'created_by' => 1]);
        ChildCategory::create(['category_id' => 4, 'name' => 'Sandals', 'created_by' => 1]);
    }
}
