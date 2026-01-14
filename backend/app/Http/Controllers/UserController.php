<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class UserController extends Controller
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

            $hasIsBarberoColumn = Schema::hasColumn('users', 'is_barbero');
            $hasIsAdminColumn = Schema::hasColumn('users', 'is_admin');
            
            $query = User::query();
            
            $selectFields = ['id', 'name', 'email', 'phone', 'points', 'created_at'];
            
            if ($hasIsBarberoColumn) {
                $selectFields[] = 'is_barbero';
            }
            
            if ($hasIsAdminColumn) {
                $selectFields[] = 'is_admin';
            }
            
            $query->select($selectFields);
            
            $users = $query->orderBy('created_at', 'desc')->get();

            // Asegurar que is_barbero e is_admin tengan valores por defecto
            $users = $users->map(function ($user) use ($hasIsBarberoColumn, $hasIsAdminColumn) {
                // Manejar is_barbero
                if (!$hasIsBarberoColumn || !isset($user->is_barbero) || $user->is_barbero === null) {
                    $isBarberoEmail = isset($user->email) && str_ends_with(strtolower($user->email), '@barbero.com');
                    $user->is_barbero = $isBarberoEmail;
                }
                
                // Manejar is_admin
                if (!$hasIsAdminColumn || !isset($user->is_admin) || $user->is_admin === null) {
                    $user->is_admin = false;
                } else {
                    // Asegurar que sea booleano
                    $user->is_admin = (bool) $user->is_admin;
                }
                
                // Asegurar que is_barbero sea booleano
                $user->is_barbero = (bool) $user->is_barbero;
                
                return $user;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en UserController@index: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar usuarios: ' . $e->getMessage()
            ], 500);
        }
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ]);
    }

    public function show(Request $request, $id)
    {
        $currentUser = $request->user();
        
        // Solo barberos y admins pueden ver perfiles de otros usuarios
        $isBarbero = (isset($currentUser->is_barbero) && $currentUser->is_barbero) || 
                     (isset($currentUser->email) && str_ends_with(strtolower($currentUser->email), '@barbero.com'));
        
        if (!$currentUser->isAdmin() && !$isBarbero) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ]);
    }

public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'phone']));

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'data' => [
                'user' => $user
            ]
        ]);
    }

public function points(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'points' => $user->points,
                'can_get_free_haircut' => $user->hasEnoughPointsForFreeHaircut()
            ]
        ]);
    }

public function notifications(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications
            ]
        ]);
    }

public function markNotificationAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = $user->notifications()->find($id);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notificación no encontrada'
            ], 404);
        }
        
        $notification->update(['read' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como leída'
        ]);
    }

public function updateEmail(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email,' . $user->id
            ],
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $errorMessage = '';
            if ($errors->has('email')) {
                $emailError = $errors->first('email');
                if (str_contains($emailError, 'already been taken') || str_contains($emailError, 'already taken')) {
                    $errorMessage = 'Este email ya está en uso por otro usuario';
                } elseif (str_contains($emailError, 'debe seguir un formato')) {
                    $errorMessage = $emailError;
                } else {
                    $errorMessage = 'El formato del email no es válido';
                }
            } elseif ($errors->has('password')) {
                $errorMessage = 'La contraseña es requerida';
            } else {
                $errorMessage = $errors->first();
            }
            return response()->json(['success' => false, 'message' => $errorMessage, 'errors' => $errors], 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'La contraseña es incorrecta'], 422);
        }

        if (strtolower($user->email) === strtolower($request->email)) {
            return response()->json(['success' => false, 'message' => 'El nuevo email debe ser diferente al actual'], 422);
        }

        $user->email = $request->email;
        $user->save();

        return response()->json(['success' => true, 'message' => 'Email actualizado exitosamente', 'data' => ['user' => $user]], 200);
    }

public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        $userToDelete = \App\Models\User::find($id);
        
        if (!$userToDelete) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if ($userToDelete->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar al usuario administrador'
            ], 403);
        }

        $userToDelete->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }
}
