<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'created_by',
        'sort_order',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function childCategories()
    {
        return $this->hasMany(ChildCategory::class)->orderBy('sort_order')->orderBy('name');
    }


    public function products()
    {
        return $this->hasMany(Product::class);
    }

}
