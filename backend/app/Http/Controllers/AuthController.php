<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Barbero;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users'
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:12',
                'confirmed',
                function ($attribute, $value, $fail) {
                    if (!preg_match('/[A-Z]/', $value)) {
                        $fail('La contraseña debe contener al menos una mayúscula');
                    }
                    if (!preg_match('/[0-9]/', $value)) {
                        $fail('La contraseña debe contener al menos un número');
                    }
                },
            ],
            'phone' => 'nullable|string|max:9|regex:/^[0-9]+$/',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $errorMessage = '';

if ($errors->has('email')) {
                $emailError = $errors->first('email');
                if (str_contains($emailError, 'already been taken')) {
                    $errorMessage = 'El email ya está en uso';
                } elseif (str_contains($emailError, 'required')) {
                    $errorMessage = 'El email es obligatorio';
                } elseif (str_contains($emailError, 'email')) {
                    $errorMessage = 'El formato del email no es válido';
                } else {
                    $errorMessage = $emailError;
                }
            } elseif ($errors->has('name')) {
                if (str_contains($errors->first('name'), 'required')) {
                    $errorMessage = 'El nombre es obligatorio';
                } elseif (str_contains($errors->first('name'), 'max')) {
                    $errorMessage = 'El nombre es demasiado largo';
                }
            } elseif ($errors->has('phone')) {
                $phoneError = $errors->first('phone');
                if (str_contains($phoneError, 'regex') || str_contains($phoneError, 'format')) {
                    $errorMessage = 'El teléfono solo debe contener números (máximo 9 dígitos)';
                } elseif (str_contains($phoneError, 'max')) {
                    $errorMessage = 'El teléfono debe tener máximo 9 dígitos';
                } else {
                    $errorMessage = $phoneError;
                }
            } elseif ($errors->has('password')) {
                $passwordError = $errors->first('password');
                if (str_contains($passwordError, 'required')) {
                    $errorMessage = 'La contraseña es obligatoria';
                } elseif (str_contains($passwordError, 'min')) {
                    $errorMessage = 'La contraseña debe tener al menos 8 caracteres';
                } elseif (str_contains($passwordError, 'max')) {
                    $errorMessage = 'La contraseña debe tener máximo 12 caracteres';
                } elseif (str_contains($passwordError, 'confirmed')) {
                    $errorMessage = 'Las contraseñas no coinciden';
                } elseif (str_contains($passwordError, 'mayúscula')) {
                    $errorMessage = 'La contraseña debe contener al menos una mayúscula';
                } elseif (str_contains($passwordError, 'número')) {
                    $errorMessage = 'La contraseña debe contener al menos un número';
                } else {
                    $errorMessage = $passwordError;
                }
            } else {
                
                $errorMessage = $errors->first();
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage
            ], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'points' => 0,
        ];

if (Schema::hasColumn('users', 'is_barbero')) {
            $userData['is_barbero'] = false; 
        }
        
        $user = User::create($userData);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => [
                'required',
                'string',
                'email'
            ],
            'password' => 'required|string',
        ]);

$isBarberoEmail = str_ends_with(strtolower($request->email), '@barbero.com');

        if ($validator->fails()) {
            $errors = $validator->errors();
            $errorMessage = '';

if ($errors->has('email')) {
                $emailError = $errors->first('email');
                if (str_contains($emailError, 'required')) {
                    $errorMessage = 'El email es obligatorio';
                } elseif (str_contains($emailError, 'debe de tener el siguiente formato')) {
                    $errorMessage = $emailError;
                } elseif (str_contains($emailError, 'email')) {
                    $errorMessage = 'El formato del email no es válido';
                } else {
                    $errorMessage = $emailError;
                }
            } elseif ($errors->has('password')) {
                if (str_contains($errors->first('password'), 'required')) {
                    $errorMessage = 'La contraseña es obligatoria';
                }
            } else {
                
                $errorMessage = $errors->first();
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

if ($isBarberoEmail) {
            // Buscar el barbero por nombre
            $barbero = Barbero::where('name', $user->name)->first();
            
            // Si no existe el barbero, crearlo
            if (!$barbero) {
                $barbero = Barbero::create([
                    'name' => $user->name,
                    'image_url' => '/imagenes/peluquero.png',
                ]);
            }

            // Actualizar el usuario con is_barbero y barbero_id
            if (Schema::hasColumn('users', 'is_barbero')) {
                $user->is_barbero = true;
                if (Schema::hasColumn('users', 'barbero_id')) {
                    $user->barbero_id = $barbero->id;
                }
                $user->save();
                $user->refresh();
            }
        }
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()
            ]
        ]);
    }
}
