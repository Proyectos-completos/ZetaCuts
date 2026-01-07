<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $newServiceTypes = [
        'corte',
        'corte_barba',
        'barba',
        'corte_gratis',
        'tinte',
        'corte_tinte',
        'corte_barba_tinte',
    ];

    private array $oldServiceTypes = [
        'corte',
        'corte_barba',
        'barba',
        'corte_gratis',
    ];

    public function up(): void
    {
        $enumList = "'" . implode("','", $this->newServiceTypes) . "'";
        DB::statement("ALTER TABLE appointments MODIFY service_type ENUM({$enumList}) NOT NULL DEFAULT 'corte'");
    }

    public function down(): void
    {
        $enumList = "'" . implode("','", $this->oldServiceTypes) . "'";
        DB::statement("ALTER TABLE appointments MODIFY service_type ENUM({$enumList}) NOT NULL DEFAULT 'corte'");
    }
};

