<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPriceSnapshot extends Model
{
    protected $fillable = [
        'product_id',
        'stock_in_id',
        'stock_out_id',
        'quantity',
        'unit_price',
        'unit_sales_price',
    ];

    protected $casts = [
        'quantity'         => 'integer',
        'unit_price'       => 'decimal:2',
        'unit_sales_price' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stockIn()
    {
        return $this->belongsTo(StockIn::class);
    }

    public function stockOut()
    {
        return $this->belongsTo(StockOut::class);
    }
}
