<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('time');
            $table->enum('service_type', ['corte', 'corte_barba', 'barba', 'corte_gratis'])->default('corte');
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            $table->boolean('is_free_haircut')->default(false);
            $table->timestamps();

$table->index(['date', 'time']);
            $table->index(['user_id', 'date']);
            $table->index('status');
        });
    }

public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
