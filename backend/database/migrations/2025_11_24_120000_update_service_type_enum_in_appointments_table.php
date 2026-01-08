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
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB: Usar MODIFY
            $enumList = "'" . implode("','", $this->newServiceTypes) . "'";
            DB::statement("ALTER TABLE appointments MODIFY service_type ENUM({$enumList}) NOT NULL DEFAULT 'corte'");
        } else {
            // SQLite u otros: No soportan ENUM, usar VARCHAR
            DB::statement("ALTER TABLE appointments ADD COLUMN service_type_new VARCHAR(50) DEFAULT 'corte'");
            DB::statement("UPDATE appointments SET service_type_new = service_type WHERE service_type_new IS NULL");
            DB::statement("ALTER TABLE appointments DROP COLUMN service_type");
            DB::statement("ALTER TABLE appointments RENAME COLUMN service_type_new TO service_type");
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
        } elseif ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB: Revertir
            $enumList = "'" . implode("','", $this->oldServiceTypes) . "'";
            DB::statement("ALTER TABLE appointments MODIFY service_type ENUM({$enumList}) NOT NULL DEFAULT 'corte'");
        } else {
            // SQLite u otros: Revertir a VARCHAR
            DB::statement("ALTER TABLE appointments ADD COLUMN service_type_old VARCHAR(50) DEFAULT 'corte'");
            DB::statement("UPDATE appointments SET service_type_old = service_type WHERE service_type_old IS NULL");
            DB::statement("ALTER TABLE appointments DROP COLUMN service_type");
            DB::statement("ALTER TABLE appointments RENAME COLUMN service_type_old TO service_type");
        }
    }
};

