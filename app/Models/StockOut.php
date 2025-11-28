<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockOut extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'note',
        'created_by',
        'stocked_at', // if same idea as stock_ins
    ];

    protected $casts = [
        'stocked_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    // ✅ ADD THIS
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function priceSnapshot()
    {
        return $this->hasOne(ProductPriceSnapshot::class);
    }

}
