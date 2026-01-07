<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Usar updateOrCreate para asegurar que el usuario admin siempre exista con los datos correctos
        User::updateOrCreate(
            ['email' => 'zetacuts@gmail.com'],
            [
                'name' => 'ZetaCuts',
                'password' => Hash::make('Pepejuan4'),
                'points' => 0,
                'phone' => null,
                'is_admin' => true,
            ]
        );
    }
}
