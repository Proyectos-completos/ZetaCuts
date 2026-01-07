<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
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
        $driver = DB::getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL: Cambiar la columna a VARCHAR con CHECK constraint
            // Esto es más compatible que intentar modificar un ENUM existente
            DB::statement("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_type_check");
            DB::statement("ALTER TABLE appointments ALTER COLUMN service_type TYPE VARCHAR(50)");
            
            $enumValues = "'" . implode("','", $this->newServiceTypes) . "'";
            DB::statement("ALTER TABLE appointments ADD CONSTRAINT appointments_service_type_check CHECK (service_type IN ({$enumValues}))");
            DB::statement("ALTER TABLE appointments ALTER COLUMN service_type SET DEFAULT 'corte'");
            DB::statement("ALTER TABLE appointments ALTER COLUMN service_type SET NOT NULL");
        } else {
            // MySQL/MariaDB: Usar MODIFY
            $enumList = "'" . implode("','", $this->newServiceTypes) . "'";
            DB::statement("ALTER TABLE appointments MODIFY service_type ENUM({$enumList}) NOT NULL DEFAULT 'corte'");
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL: Revertir al constraint anterior
            DB::statement("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_type_check");
            
            $enumValues = "'" . implode("','", $this->oldServiceTypes) . "'";
            DB::statement("ALTER TABLE appointments ADD CONSTRAINT appointments_service_type_check CHECK (service_type IN ({$enumValues}))");
            
            DB::statement("ALTER TABLE appointments ALTER COLUMN service_type SET DEFAULT 'corte'");
            DB::statement("ALTER TABLE appointments ALTER COLUMN service_type SET NOT NULL");
        } else {
            // MySQL/MariaDB: Revertir
            $enumList = "'" . implode("','", $this->oldServiceTypes) . "'";
            DB::statement("ALTER TABLE appointments MODIFY service_type ENUM({$enumList}) NOT NULL DEFAULT 'corte'");
        }
    }
};

