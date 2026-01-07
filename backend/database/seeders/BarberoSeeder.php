<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Barbero;
use Illuminate\Support\Facades\DB;

class BarberoSeeder extends Seeder
{
    public function run(): void
    {
        // Seeder deshabilitado: los barberos se gestionan desde la aplicación
        // No se insertan barberos por defecto para preservar los datos existentes
        return;
    }
}
