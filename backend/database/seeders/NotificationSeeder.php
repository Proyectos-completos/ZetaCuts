<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // Eliminar notificaciones de ejemplo que puedan existir
        Notification::where('message', 'like', '%Juan Pérez%')
            ->orWhere('message', 'like', '%María García%')
            ->orWhere('message', 'like', '%Carlos López%')
            ->orWhere('title', 'Mantenimiento del sistema')
            ->delete();
        
        // Seeder deshabilitado: las notificaciones se crean automáticamente desde la aplicación
        // No se insertan notificaciones de ejemplo para preservar los datos reales
        return;
    }
} 