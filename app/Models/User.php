<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Setting;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password','role',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function isRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    // relationships
    public function products()
    {
        return $this->hasMany(Product::class, 'created_by');
    }

    public function brands()
    {
        return $this->hasMany(Brand::class, 'created_by');
    }

    public function categories()
    {
        return $this->hasMany(Category::class, 'created_by');
    }

    public function stockIns()
    {
        return $this->hasMany(StockIn::class, 'created_by');
    }

    public function stockOuts()
    {
        return $this->hasMany(StockOut::class, 'created_by');
    }
    public function settings()
    {
        return $this->hasMany(Setting::class, 'created_by');
    }
}
