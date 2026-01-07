<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('barbero_id')->nullable()->constrained('barberos')->onDelete('set null');
            $table->index(['barbero_id', 'date', 'time']);
        });
    }

public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['barbero_id', 'date', 'time']);
            $table->dropForeign(['barbero_id']);
            $table->dropColumn('barbero_id');
        });
    }
};
