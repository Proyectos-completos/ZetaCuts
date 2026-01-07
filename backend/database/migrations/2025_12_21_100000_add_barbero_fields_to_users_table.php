<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_barbero')) {
                $table->boolean('is_barbero')->default(false)->after('is_admin');
            }
            if (!Schema::hasColumn('users', 'barbero_id')) {
                $table->foreignId('barbero_id')->nullable()->after('is_admin')->constrained('barberos')->onDelete('cascade');
            }
        });
    }

public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'barbero_id')) {
                $table->dropForeign(['barbero_id']);
                $table->dropColumn('barbero_id');
            }
            if (Schema::hasColumn('users', 'is_barbero')) {
                $table->dropColumn('is_barbero');
            }
        });
    }
};

