<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockIn extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'note',
        'created_by',
        'stocked_at', // if you added custom timestamp column
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
}
