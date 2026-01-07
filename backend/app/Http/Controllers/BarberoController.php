<?php

namespace App\Http\Controllers;

use App\Models\Barbero;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class BarberoController extends Controller
{

    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user || !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para realizar esta acción'
                ], 403);
            }

            // Sincronizar usuarios barberos que no tienen registro en la tabla barberos
            $this->syncBarberoUsers();
            
            // Solo devolver barberos que tienen usuarios asociados válidos
            $query = Barbero::whereHas('user', function($q) {
                $q->where(function($subQ) {
                    $subQ->where('is_barbero', true)
                         ->orWhere('email', 'like', '%@barbero.com');
                });
            });

            if ($request->has('search') && !empty($request->search)) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $sort = $request->get('sort', 'asc');
            $query->orderBy('name', $sort);

            $barberos = $query->get();

            return response()->json([
                'success' => true,
                'data' => $barberos
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en BarberoController@index: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar barberos: ' . $e->getMessage()
            ], 500);
        }
    }

public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:barberos,name',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users',
                function ($attribute, $value, $fail) {
                    $email = strtolower($value);
                    
                    if (str_ends_with($email, '@gmail.com')) {
                        $fail('No se puede crear un cliente. El email debe terminar en @barbero.com');
                    } elseif (!str_ends_with($email, '@barbero.com')) {
                        $fail('El email del barbero debe ser de formato: ejemplo@barbero.com');
                    }
                }
            ],
            'phone' => 'nullable|string|max:9|regex:/^[0-9]+$/',
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
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            
            if ($errors->has('name') && str_contains($errors->first('name'), 'already been taken')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe un barbero con ese nombre'
                ], 422);
            }
            
            if ($errors->has('email')) {
                $emailError = $errors->first('email');
                if (str_contains($emailError, 'No se puede crear un cliente')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No se puede crear un cliente. El email debe terminar en @barbero.com'
                    ], 422);
                } elseif (str_contains($emailError, 'already been taken')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El email ya está en uso'
                    ], 422);
                } elseif (str_contains($emailError, 'required')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El email es obligatorio'
                    ], 422);
                } elseif (str_contains($emailError, 'debe ser de formato') || str_contains($emailError, '@barbero.com')) {
                    return response()->json([
                        'success' => false,
                        'message' => $emailError
                    ], 422);
                } elseif (str_contains($emailError, 'email')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El formato del email no es válido'
                    ], 422);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => $emailError
                    ], 422);
                }
            }
            
            if ($errors->has('phone')) {
                $phoneError = $errors->first('phone');
                if (str_contains($phoneError, 'regex') || str_contains($phoneError, 'format')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El teléfono solo debe contener números (máximo 9 dígitos)'
                    ], 422);
                } elseif (str_contains($phoneError, 'max')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El teléfono debe tener máximo 9 dígitos'
                    ], 422);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => $phoneError
                    ], 422);
                }
            }
            
            if ($errors->has('password')) {
                if (str_contains($errors->first('password'), 'required')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'La contraseña es obligatoria'
                    ], 422);
                } elseif (str_contains($errors->first('password'), 'min')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'La contraseña debe tener al menos 8 caracteres'
                    ], 422);
                } elseif (str_contains($errors->first('password'), 'confirmed')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Las contraseñas no coinciden'
                    ], 422);
                }
            }
            
            return response()->json([
                'success' => false,
                'message' => $errors->first()
            ], 422);
        }

        // Usar transacción para crear barbero y usuario de forma atómica
        $result = DB::transaction(function () use ($request) {
            $barbero = Barbero::create([
                'name' => $request->name,
                'image_url' => '/imagenes/peluquero.png',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'points' => 0,
            ]);

            // Asociar usuario con barbero si la columna existe
            if (Schema::hasColumn('users', 'barbero_id')) {
                $user->barbero_id = $barbero->id;
                $user->is_barbero = true;
                $user->save();
            }

            return ['barbero' => $barbero, 'user' => $user];
        });

        $barbero = $result['barbero'];
        $user = $result['user'];

if (Schema::hasColumn('users', 'is_barbero')) {
            $user->is_barbero = true;
            if (Schema::hasColumn('users', 'barbero_id')) {
                $user->barbero_id = $barbero->id;
            }
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Barbero creado exitosamente',
            'data' => [
                'barbero' => $barbero,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ]
        ], 201);
    }

public function show(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        $barbero = Barbero::find($id);

        if (!$barbero) {
            return response()->json([
                'success' => false,
                'message' => 'Barbero no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $barbero
        ]);
    }

public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        $barbero = Barbero::find($id);

        if (!$barbero) {
            return response()->json([
                'success' => false,
                'message' => 'Barbero no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:barberos,name,' . $id,
        ]);

        if ($validator->fails()) {
            if ($validator->errors()->has('name') && $validator->errors()->first('name') === 'The name has already been taken.') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe un barbero con ese nombre'
                ], 422);
            }
            return response()->json([
                'success' => false,
                'message' => 'El nombre es obligatorio'
            ], 422);
        }

        $updateData = ['name' => $request->name];

if (!$barbero->image_url) {
            $updateData['image_url'] = '/imagenes/peluquero.png';
        }
        
        $barbero->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Barbero actualizado exitosamente',
            'data' => $barbero
        ]);
    }

public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        $barbero = Barbero::find($id);

        if (!$barbero) {
            return response()->json([
                'success' => false,
                'message' => 'Barbero no encontrado'
            ], 404);
        }

        // Buscar y eliminar el usuario asociado al barbero si existe la columna barbero_id
        if (Schema::hasColumn('users', 'barbero_id')) {
            $user = User::where('barbero_id', $barbero->id)->first();
            if ($user) {
                // Eliminar tokens del usuario
                try {
                    DB::table('personal_access_tokens')
                        ->where('tokenable_type', 'App\Models\User')
                        ->where('tokenable_id', $user->id)
                        ->delete();
                } catch (\Exception $e) {
                    Log::warning('Error eliminando tokens: ' . $e->getMessage());
                }
                
                // Eliminar el usuario
                $user->delete();
            }
        } else {
            // Si no existe la columna barbero_id, buscar por email (los barberos tienen @barbero.com)
            $barberoName = $barbero->name;
            $user = User::where('name', $barberoName)
                ->where('email', 'like', '%@barbero.com')
                ->first();
            
            if ($user && !$user->is_admin) {
                try {
                    DB::table('personal_access_tokens')
                        ->where('tokenable_type', 'App\Models\User')
                        ->where('tokenable_id', $user->id)
                        ->delete();
                } catch (\Exception $e) {
                    Log::warning('Error eliminando tokens: ' . $e->getMessage());
                }
                
                $user->delete();
            }
        }

        // Eliminar el barbero
        $barbero->delete();

        return response()->json([
            'success' => true,
            'message' => 'Barbero eliminado exitosamente'
        ]);
    }

public function getAppointments(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        $barbero = Barbero::find($id);

        if (!$barbero) {
            return response()->json([
                'success' => false,
                'message' => 'Barbero no encontrado'
            ], 404);
        }

        $appointments = $barbero->appointments()
            ->where(function($query) {
                $query->whereNull('notes')
                      ->orWhere(function($q) {
                          $q->where('notes', 'not like', '[ARCHIVED]%')
                            ->where('notes', 'not like', '[DELETED]%');
                      });
            })
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'barbero' => $barbero,
                'appointments' => $appointments
            ]
        ]);
    }
    
    /**
     * Sincroniza usuarios barberos que no tienen registro en la tabla barberos
     */
    private function syncBarberoUsers()
    {
        // Obtener todos los IDs de barberos existentes
        $existingBarberoIds = Barbero::pluck('id')->toArray();
        
        // Buscar usuarios que son barberos pero no tienen registro en la tabla barberos
        $barberoUsers = User::where(function($query) {
            $query->where('is_barbero', true)
                  ->orWhere('email', 'like', '%@barbero.com');
        })
        ->where(function($query) use ($existingBarberoIds) {
            $query->whereNull('barbero_id');
            if (!empty($existingBarberoIds)) {
                $query->orWhereNotIn('barbero_id', $existingBarberoIds);
            }
        })
        ->get();

        foreach ($barberoUsers as $user) {
            // Verificar si ya existe un barbero con ese nombre
            $barbero = Barbero::where('name', $user->name)->first();
            
            if (!$barbero) {
                // Crear el registro en la tabla barberos
                $barbero = Barbero::create([
                    'name' => $user->name,
                    'image_url' => '/imagenes/peluquero.png',
                ]);
            }
            
            // Asociar el usuario con el barbero
            if (Schema::hasColumn('users', 'barbero_id')) {
                $user->barbero_id = $barbero->id;
                $user->is_barbero = true;
                $user->save();
            }
        }
    }
}
