<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'category',
        'brand',
        'image_url',
        'purchase_url',
        'gallery',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'gallery' => 'array',
        'is_active' => 'boolean',
    ];

}

