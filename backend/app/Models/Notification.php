<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'read',
        'user_id'
    ];

    protected $casts = [
        'data' => 'array',
        'read' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
