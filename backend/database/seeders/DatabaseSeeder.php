<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        $this->call([
            AdminUserSeeder::class,
            // BarberoSeeder::class, // Deshabilitado: no queremos barberos por defecto
            NotificationSeeder::class, // Se ejecuta para limpiar notificaciones de ejemplo
            ProductSeeder::class,
        ]);
    }
}
