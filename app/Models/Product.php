<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'barcode',
        'brand_id',
        'category_id',
        'child_category_id',
        'price',
        'sales_price',
        'created_by',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sales_price' => 'decimal:2',
    ];
    protected $appends = ['quantity'];

    /* -------------------------
        Relationships
    --------------------------*/

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function childCategory()
    {
        return $this->belongsTo(ChildCategory::class, 'child_category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function stockIns()
    {
        return $this->hasMany(StockIn::class);
    }

    public function stockOuts()
    {
        return $this->hasMany(StockOut::class);
    }

    /* -------------------------
        Computed Quantity
    --------------------------*/
    public function getQuantityAttribute(): int
    {
        $in = (int) $this->stockIns()->sum('quantity');
        $out = (int) $this->stockOuts()->sum('quantity');
        return $in - $out;
    }

    /* -------------------------
        SKU + Barcode Auto Generation
    --------------------------*/
    protected static function booted()
    {
        static::creating(function ($product) {

            // auto SKU
            if (empty($product->sku)) {
                $product->sku = self::generateSku($product->name);
            }

            // ensure SKU uniqueness
            while (self::where('sku', $product->sku)->exists()) {
                $product->sku = self::generateSku($product->name);
            }

            // auto BARCODE from SKU
            if (empty($product->barcode)) {
                $product->barcode = self::generateBarcodeFromSku($product->sku);
            }

            // ensure barcode uniqueness
            while (self::where('barcode', $product->barcode)->exists()) {
                $product->sku = self::generateSku($product->name);
                $product->barcode = self::generateBarcodeFromSku($product->sku);
            }
        });

        static::updating(function ($product) {
            // regenerate barcode if SKU changed
            if ($product->isDirty('sku')) {
                $product->barcode = self::generateBarcodeFromSku($product->sku);

                while (self::where('barcode', $product->barcode)
                    ->where('id', '!=', $product->id)
                    ->exists()) {

                    $product->sku = self::generateSku($product->name);
                    $product->barcode = self::generateBarcodeFromSku($product->sku);
                }
            }
        });
    }

    public static function generateSku(?string $name = null): string
    {
        $prefix = $name
            ? strtoupper(Str::of($name)->replace(' ', '')->substr(0, 3))
            : 'SKU';

        return $prefix . '-' . strtoupper(Str::random(6));
    }

    public static function generateBarcodeFromSku(string $sku): string
    {
        return 'BCR-' . strtoupper(Str::of($sku)->replace('-', ''));
    }
}
