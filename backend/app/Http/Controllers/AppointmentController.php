<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Barbero;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $isBarbero = false;
        $barberoId = null;
        
        // Verificar si el usuario es barbero
        if (isset($user->is_barbero) && $user->is_barbero) {
            $isBarbero = true;
            $barberoId = $user->barbero_id ?? null;
        }
        
        // Si no está marcado como barbero pero tiene email @barbero.com, buscar el barbero
        if (!$isBarbero && isset($user->email) && str_ends_with(strtolower($user->email), '@barbero.com')) {
            $isBarbero = true;
            $barbero = Barbero::where('name', $user->name)->first();
            if ($barbero) {
                $barberoId = $barbero->id;
                
                // Actualizar el usuario con el barbero_id si no lo tiene
                if (Schema::hasColumn('users', 'barbero_id') && !$user->barbero_id) {
                    $user->barbero_id = $barberoId;
                    $user->is_barbero = true;
                    $user->save();
                }
            }
        }
        
        // Si el usuario es barbero, solo mostrar sus citas
        if ($isBarbero) {
            // Si no tiene barbero_id, intentar encontrarlo por nombre
            if (!$barberoId) {
                $barbero = Barbero::where('name', $user->name)->first();
                if ($barbero) {
                    $barberoId = $barbero->id;
                    // Actualizar el usuario
                    if (Schema::hasColumn('users', 'barbero_id')) {
                        $user->barbero_id = $barberoId;
                        $user->is_barbero = true;
                        $user->save();
                    }
                }
            }
            
            // Si después de todo no tiene barbero_id, devolver array vacío
            if (!$barberoId) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'appointments' => []
                    ]
                ]);
            }
            
            // Para barberos: solo mostrar citas del barbero (no eliminadas ni archivadas)
            $appointments = Appointment::where('barbero_id', $barberoId)
                ->where(function($query) {
                    $query->whereNull('notes')
                          ->orWhere(function($q) {
                              $q->where('notes', 'not like', '[ARCHIVED]%')
                                ->where('notes', 'not like', '[DELETED]%');
                          });
                })
                ->with('user', 'barbero')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Si el usuario es admin, mostrar TODAS las citas de todos los clientes
            if ($user->is_admin) {
                $appointments = Appointment::with('barbero', 'user')
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                // Para usuarios normales: mostrar TODAS sus citas (historial completo)
                // Incluye citas activas, archivadas y eliminadas
                $appointments = $user->appointments()
                    ->with('barbero')
                    ->orderBy('created_at', 'desc')
                    ->get();
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'appointments' => $appointments
            ]
        ]);
    }

    public function getAvailableSlots(Request $request)
    {
        date_default_timezone_set('Europe/Madrid');
        
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'barbero_id' => 'nullable|exists:barberos,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = $request->date;
        $barberoId = $request->barbero_id;

        Log::info('getAvailableSlots called', [
            'date' => $date,
            'barbero_id' => $barberoId
        ]);

        $workingHours = [
            'start' => 9,
            'end' => 19,
            'days' => [1, 2, 3, 4, 5] 
        ];

        $dayOfWeek = date('N', strtotime($date)); 
        
        Log::info('Day of week', ['dayOfWeek' => $dayOfWeek, 'workingDays' => $workingHours['days']]);
        
        if (!in_array($dayOfWeek, $workingHours['days'])) {
            Log::info('Weekend day detected');
            return response()->json([
                'success' => true,
                'data' => [
                    'available_slots' => [],
                    'message' => 'No hay citas disponibles en fin de semana'
                ]
            ]);
        }

        $allSlots = [];
        for ($hour = $workingHours['start']; $hour < $workingHours['end']; $hour++) {
            $timeString = sprintf('%02d:00', $hour);
            $allSlots[] = $timeString;
        }

        Log::info('All slots generated', ['allSlots' => $allSlots]);

        $bookedAppointments = Appointment::where('date', $date)
            ->where('status', '!=', 'cancelled')
            ->where(function($query) {
                $query->whereNull('notes')
                      ->orWhere(function($q) {
                          $q->where('notes', 'not like', '[DELETED]%')
                            ->where('notes', 'not like', '[ARCHIVED]%');
                      });
            });

        if ($barberoId) {
            $bookedAppointments->where('barbero_id', $barberoId);
        }

        $bookedSlots = $bookedAppointments->pluck('time')->map(function($time) {
            return substr($time, 0, 5); 
        })->toArray();
        
        Log::info('Booked slots found', [
            'bookedSlots' => $bookedSlots,
            'query' => $bookedAppointments->toSql(),
            'bindings' => $bookedAppointments->getBindings()
        ]);

        $availableSlots = array_values(array_diff($allSlots, $bookedSlots));
        
        $today = date('Y-m-d');
        if ($date === $today) {
            $currentHour = (int)date('H');
            $currentMinute = (int)date('i');
            
            Log::info('Filtering today slots', [
                'current_hour' => $currentHour,
                'current_minute' => $currentMinute,
                'current_time' => date('H:i'),
                'all_slots_before_filter' => $availableSlots
            ]);
            
            $availableSlots = array_filter($availableSlots, function($slot) use ($currentHour, $currentMinute) {
                $slotHour = (int)substr($slot, 0, 2);
                
                if ($slotHour > $currentHour) {
                    Log::info("Slot {$slot} (future hour): available");
                    return true;
                }
                
                if ($slotHour === $currentHour) {
                    
                    $isAvailable = false; 
                    Log::info("Slot {$slot} (current hour): not available - current time is {$currentHour}:{$currentMinute}");
                    return $isAvailable;
                }
                Log::info("Slot {$slot} (past hour): not available");
                return false;
            });
            
            $availableSlots = array_values($availableSlots);
            
            Log::info('Available slots after filtering', [
                'available_slots' => $availableSlots
            ]);
        }
        
        Log::info('Available slots calculated', ['availableSlots' => $availableSlots]);

        return response()->json([
            'success' => true,
            'data' => [
                'available_slots' => $availableSlots,
                'booked_slots' => $bookedSlots, 
                'date' => $date,
                'barbero_id' => $barberoId,
                'debug' => [
                    'all_slots' => $allSlots,
                    'booked_slots' => $bookedSlots,
                    'day_of_week' => $dayOfWeek,
                    'is_today' => $date === $today,
                    'current_time' => date('H:i')
                ]
            ]
        ]);
    }

    public function getBarberos()
    {
        // Sincronizar usuarios barberos que no tienen registro en la tabla barberos
        $this->syncBarberoUsers();
        
        // Solo devolver barberos que tienen usuarios asociados válidos
        $barberos = Barbero::whereHas('user', function($query) {
            $query->where(function($q) {
                $q->where('is_barbero', true)
                  ->orWhere('email', 'like', '%@barbero.com');
            });
        })->get();

        return response()->json([
            'success' => true,
            'data' => [
                'barberos' => $barberos
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

    public function store(Request $request)
    {
        date_default_timezone_set('Europe/Madrid');
        
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'barbero_id' => 'required|exists:barberos,id',
            'service_type' => 'required|in:corte,corte_barba,barba,corte_gratis,tinte,corte_tinte,corte_barba_tinte',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $today = date('Y-m-d');
        if ($request->date === $today) {
            $currentHour = (int)date('H');
            $currentMinute = (int)date('i');
            $requestedHour = (int)substr($request->time, 0, 2);
            
            if ($requestedHour < $currentHour) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pueden reservar citas para horas pasadas'
                ], 400);
            }
            
            if ($requestedHour === $currentHour && $currentMinute > 40) {
                return response()->json([
                    'success' => false,
                    'message' => 'Para reservar en la hora actual, debe ser al menos 20 minutos antes'
                ], 400);
            }
        }

        if ($request->service_type === 'corte_gratis') {
            if (!$user->hasEnoughPointsForFreeHaircut()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes suficientes puntos para un corte gratis. Necesitas 100 puntos.'
                ], 400);
            }
        }

        $existingAppointment = Appointment::where('date', $request->date)
            ->where('time', $request->time)
            ->where('barbero_id', $request->barbero_id)
            ->where('status', '!=', 'cancelled')
            ->where(function($query) {
                $query->whereNull('notes')
                      ->orWhere(function($q) {
                          $q->where('notes', 'not like', '[DELETED]%')
                            ->where('notes', 'not like', '[ARCHIVED]%');
                      });
            })
            ->first();

        if ($existingAppointment) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una cita reservada para esa fecha, hora y barbero'
            ], 400);
        }

        // Usar transacción para asegurar consistencia de datos
        $appointment = DB::transaction(function () use ($request, $user) {
            $appointment = Appointment::create([
                'user_id' => $user->id,
                'barbero_id' => $request->barbero_id,
                'date' => $request->date,
                'time' => $request->time,
                'service_type' => $request->service_type,
                'notes' => $request->notes,
                'is_free_haircut' => $request->service_type === 'corte_gratis',
                'status' => 'pending'
            ]);

            // Si es corte gratis, descontar puntos dentro de la transacción
            if ($request->service_type === 'corte_gratis') {
                $user->usePointsForFreeHaircut();
            }

            // Crear notificación dentro de la transacción
            try {
                $dateParts = explode('-', $request->date);
                $formattedDate = $dateParts[2] . '-' . $dateParts[1] . '-' . $dateParts[0];
                
                \App\Models\Notification::create([
                    'title' => 'Nueva cita reservada',
                    'message' => "Nueva cita reservada por {$user->name} para el {$formattedDate} a las {$request->time}",
                    'type' => 'appointment_created',
                    'user_id' => null, 
                    'read' => false
                ]);
                
                Log::info('Notificación creada exitosamente', [
                    'user_name' => $user->name,
                    'date' => $request->date,
                    'time' => $request->time
                ]);
            } catch (\Exception $e) {
                Log::error('Error creando notificación', [
                    'error' => $e->getMessage(),
                    'user_name' => $user->name,
                    'date' => $request->date,
                    'time' => $request->time
                ]);
                // No lanzar excepción para no romper la transacción
            }

            return $appointment;
        });

        return response()->json([
            'success' => true,
            'message' => 'Cita creada exitosamente',
            'data' => [
                'appointment' => $appointment->load('barbero')
            ]
        ], 201);
    }

    public function show(Request $request, Appointment $appointment)
    {
        if ($appointment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'appointment' => $appointment->load('barbero')
            ]
        ]);
    }

    private function getUserBarberoId($user)
    {
        if (isset($user->is_barbero) && $user->is_barbero) {
            return $user->barbero_id ?? null;
        }
        
        if (isset($user->email) && str_ends_with(strtolower($user->email), '@barbero.com')) {
            $barbero = Barbero::where('name', $user->name)->first();
            if ($barbero) {
                if (Schema::hasColumn('users', 'barbero_id') && !$user->barbero_id) {
                    $user->barbero_id = $barbero->id;
                    $user->save();
                }
                return $barbero->id;
            }
        }
        
        return null;
    }

    public function update(Request $request, Appointment $appointment)
    {
        $user = $request->user();
        
        $isOwner = $appointment->user_id === $user->id;
        $isAdmin = $user->is_admin ?? false;
        $userBarberoId = $this->getUserBarberoId($user);
        $isBarbero = $userBarberoId && $appointment->barbero_id === $userBarberoId;
        
        if (!$isOwner && !$isAdmin && !$isBarbero) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|required|date|after:today',
            'time' => 'sometimes|required|date_format:H:i',
            'barbero_id' => 'sometimes|required|exists:barberos,id',
            'service_type' => 'sometimes|required|in:corte,corte_barba,barba,corte_gratis,tinte,corte_tinte,corte_barba_tinte',
            'notes' => 'sometimes|nullable|string|max:500',
            'status' => 'sometimes|required|in:pending,confirmed,cancelled,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $previousStatus = $appointment->status;
        $newStatus = $request->input('status');

        if ($newStatus === 'cancelled' && $previousStatus !== 'cancelled' && $appointment->is_free_haircut) {
            $user = $appointment->user;
            $user->addPoints(100);
        }

        $appointment->update($request->all());

        if ($newStatus === 'completed' && $previousStatus !== 'completed') {
            $this->awardPointsForCompletedAppointment($appointment);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cita actualizada exitosamente',
            'data' => [
                'appointment' => $appointment->load(['barbero', 'user']),
                'user' => [
                    'points' => $appointment->user->points
                ]
            ]
        ]);
    }

    private function awardPointsForCompletedAppointment(Appointment $appointment)
    {
        $user = $appointment->user;
        $pointsToAward = 0;

        switch ($appointment->service_type) {
            case 'corte':
                $pointsToAward = 10;
                break;
            case 'corte_barba':
                $pointsToAward = 15;
                break;
            case 'corte_tinte':
                $pointsToAward = 10;
                break;
            case 'corte_barba_tinte':
                $pointsToAward = 15;
                break;
            case 'tinte':
                $pointsToAward = 0;
                break;
            case 'barba':
                $pointsToAward = 5; 
                break;
            case 'corte_gratis':
                $pointsToAward = 0; 
                break;
            default:
                $pointsToAward = 0;
                break;
        }

        if ($pointsToAward > 0) {
            $user->addPoints($pointsToAward);
        }
    }

    public function destroy(Request $request, Appointment $appointment)
    {
        $user = $request->user();
        
        $isOwner = $appointment->user_id === $user->id;
        $isAdmin = $user->is_admin ?? false;
        $userBarberoId = $this->getUserBarberoId($user);
        $isBarbero = $userBarberoId && $appointment->barbero_id === $userBarberoId;
        
        if (!$isOwner && !$isAdmin && !$isBarbero) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        // Marcar la cita como eliminada en lugar de borrarla físicamente
        // Esto permite mantener el historial completo en "Mis citas"
        // Las citas eliminadas seguirán apareciendo en el historial del usuario
        // pero no se mostrarán a los barberos ni se considerarán en disponibilidad
        if ($appointment->status === 'completed') {
            // Si está completada, la archivamos
            $appointment->notes = '[ARCHIVED]' . ($appointment->notes ? ' ' . $appointment->notes : '');
        } else {
            // Si no está completada, la marcamos como eliminada
            $appointment->notes = '[DELETED]' . ($appointment->notes ? ' ' . $appointment->notes : '');
            $appointment->status = 'cancelled'; // Cambiar estado a cancelled para que no se considere activa
        }
        $appointment->save();

        return response()->json([
            'success' => true,
            'message' => 'Cita eliminada exitosamente'
        ]);
    }
}
