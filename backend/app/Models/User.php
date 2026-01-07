<?php

namespace App\Models;

use App\Models\Appointment;
use App\Models\Barbero;
use App\Models\Notification;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'points',
        'phone',
        'is_admin',
        'is_barbero',
        'barbero_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'points' => 'integer',
            'is_admin' => 'boolean',
            'is_barbero' => 'boolean',
        ];
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function addPoints(int $points)
    {
        $this->increment('points', $points);
        return $this;
    }

    public function hasEnoughPointsForFreeHaircut(): bool
    {
        return $this->points >= 100;
    }

    public function usePointsForFreeHaircut()
    {
        if ($this->hasEnoughPointsForFreeHaircut()) {
            $this->decrement('points', 100);
            return true;
        }
        return false;
    }

    public function isAdmin(): bool
    {
        return isset($this->is_admin) && (bool)$this->is_admin;
    }

    public function isBarbero(): bool
    {
        try {
            return isset($this->attributes['is_barbero']) && (bool)$this->attributes['is_barbero'];
        } catch (\Exception $e) {
            return false;
        }
    }

    public function barbero()
    {
        try {
            if (!isset($this->attributes['barbero_id']) || !$this->attributes['barbero_id']) {
                return null;
            }
            return $this->belongsTo(Barbero::class);
        } catch (\Exception $e) {
            return null;
        }
    }
}