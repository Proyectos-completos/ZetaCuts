<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

/**
 * Tests de integración para la API REST
 * 
 * Este archivo contiene tests para verificar el funcionamiento
 * de los endpoints de la API.
 */
class ApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de registro de usuario
     * 
     * Verifica que el endpoint de registro funciona correctamente
     * y crea un usuario en la base de datos.
     */
    public function test_user_registration(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@gmail.com',
            'password' => 'Test1234',
            'password_confirmation' => 'Test1234',
            'phone' => '123456789'
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                 ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@gmail.com',
            'name' => 'Test User'
        ]);
    }

    /**
     * Test de login de usuario
     * 
     * Verifica que el endpoint de login funciona correctamente
     * y devuelve un token de autenticación.
     */
    public function test_user_login(): void
    {
        $user = User::factory()->create([
            'email' => 'test@gmail.com',
            'password' => Hash::make('Test1234'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@gmail.com',
            'password' => 'Test1234',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ])
                 ->assertJsonStructure([
                     'data' => [
                         'user',
                         'token',
                         'token_type'
                     ]
                 ]);
    }

    /**
     * Test de validación de formulario
     * 
     * Verifica que la validación de datos funciona correctamente
     * y rechaza datos inválidos.
     */
    public function test_validation_fails_with_invalid_data(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
            'password_confirmation' => '456',
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                 ]);
    }
}

