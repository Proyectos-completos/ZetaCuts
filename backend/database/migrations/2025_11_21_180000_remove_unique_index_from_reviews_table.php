<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('barbero_id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique('reviews_user_id_barbero_id_unique');
        });
    }

public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->unique(['user_id', 'barbero_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['barbero_id']);
        });
    }
};

