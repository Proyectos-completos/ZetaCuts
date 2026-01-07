<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'barbero_id',
        'date',
        'time',
        'service_type',
        'status',
        'notes',
        'is_free_haircut',
    ];

    protected $casts = [
        'date' => 'date',
        'is_free_haircut' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function barbero()
    {
        return $this->belongsTo(Barbero::class);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeForTime($query, $time)
    {
        return $query->where('time', $time);
    }

    public function scopeForBarbero($query, $barberoId)
    {
        return $query->where('barbero_id', $barberoId);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }
} 