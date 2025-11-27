<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::create([
            'name' => 'Floral Summer Dress',
            'sku' => 'SKU-DRS001',
            'barcode' => 'BCRDRS001',
            'brand_id' => 1, // Zara
            'category_id' => 1, // Women
            'child_category_id' => 1, // Dresses
            'price' => 1200,
            'created_by' => 1,
        ]);

        Product::create([
            'name' => 'Slim Fit Polo Shirt',
            'sku' => 'SKU-MNS001',
            'barcode' => 'BCRMNS001',
            'brand_id' => 3, // Uniqlo
            'category_id' => 2, // Men
            'child_category_id' => 4, // Shirts
            'price' => 900,
            'created_by' => 1,
        ]);

        Product::create([
            'name' => 'Leather Shoulder Bag',
            'sku' => 'SKU-BAG001',
            'barcode' => 'BCRBAG001',
            'brand_id' => 2, // H&M
            'category_id' => 3, // Accessories
            'child_category_id' => 7, // Bags
            'price' => 1500,
            'created_by' => 1,
        ]);

        Product::create([
            'name' => 'White Sneakers',
            'sku' => 'SKU-SNK001',
            'barcode' => 'BCRSNK001',
            'brand_id' => 5, // Bench
            'category_id' => 4, // Footwear
            'child_category_id' => 10, // Sneakers
            'price' => 1800,
            'created_by' => 1,
        ]);
    }
}
