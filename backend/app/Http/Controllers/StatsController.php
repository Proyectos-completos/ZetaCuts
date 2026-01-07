<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function getMarketStudy(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción'
            ], 403);
        }

        // Obtener todas las citas en los últimos 12 meses con la información del barbero
        $allAppointments = Appointment::with('barbero')
            ->where('date', '>=', now()->subMonths(11)->startOfMonth())
            ->get();

        $monthlyData = [];
        
        $mesesEspanol = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];
        
        // Inicializar los últimos 12 meses
        for ($i = 11; $i >= 0; $i--) {
            $monthDate = now()->subMonths($i);
            $monthKey = $monthDate->format('Y-m');
            $monthName = $mesesEspanol[(int)$monthDate->format('n')];
            
            $monthlyData[$monthKey] = [
                'month' => $monthName,
                'key' => $monthKey,
                'appointments' => 0,
                'income' => 0,
                'services' => [
                    'corte' => 0,
                    'corte_barba' => 0,
                    'tinte' => 0,
                    'otros' => 0
                ]
            ];
        }

        $completedAppointmentsCount = 0;
        $cancelledAppointmentsCount = 0;
        foreach ($allAppointments as $appointment) {
            $monthKey = date('Y-m', strtotime($appointment->date));
            if (!isset($monthlyData[$monthKey])) continue;

            // El volumen de citas muestra toda la actividad (pendientes, confirmadas y completadas)
            $monthlyData[$monthKey]['appointments']++;
            
            // Si la cita está cancelada, la contamos para el resumen
            if ($appointment->status === 'cancelled') {
                $cancelledAppointmentsCount++;
                continue;
            }

            // Solo sumamos ingresos y desglosamos servicios si la cita está COMPLETADA
            if ($appointment->status === 'completed') {
                $completedAppointmentsCount++;
                $price = 0;
                $type = $appointment->service_type;
                
                // Lógica de precios (estimados del negocio)
                if ($type === 'corte') {
                    $price = 11;
                    $monthlyData[$monthKey]['services']['corte']++;
                } elseif ($type === 'corte_barba') {
                    $price = 14;
                    $monthlyData[$monthKey]['services']['corte_barba']++;
                } elseif ($type === 'barba') {
                    $price = 3;
                    $monthlyData[$monthKey]['services']['otros']++;
                } elseif (str_contains($type, 'tinte')) {
                    // Extraer el precio real del tinte desde las notas
                    $tintePrice = 65; // Precio por defecto
                    if ($appointment->notes) {
                        // Buscar el patrón "Precio tinte: €65" o "Precio tinte: €70" o variaciones
                        // El formato puede ser: "Precio tinte: €65" o "Precio tinte: 65" o "Precio tinte:€65"
                        if (preg_match('/Precio\s+tinte:\s*€?\s*(\d+)/i', $appointment->notes, $matches)) {
                            $tintePrice = (int)$matches[1];
                        }
                    }
                    
                    // Sumar el precio del corte/barba + el precio del tinte
                    if ($type === 'corte_tinte') {
                        // Corte (11€) + Tinte (65€ o 70€)
                        $price = 11 + $tintePrice;
                    } elseif ($type === 'corte_barba_tinte') {
                        // Corte + Barba (14€) + Tinte (65€ o 70€)
                        $price = 14 + $tintePrice;
                    } elseif ($type === 'tinte') {
                        // Solo tinte (65€ o 70€)
                        $price = $tintePrice;
                    } else {
                        // Por si acaso hay otros tipos con tinte
                        $price = $tintePrice;
                    }
                    
                    $monthlyData[$monthKey]['services']['tinte']++;
                } elseif ($type === 'corte_gratis') {
                    $price = 0;
                    $monthlyData[$monthKey]['services']['otros']++;
                }

                $monthlyData[$monthKey]['income'] += $price;
            }
        }

        // Convertir a array indexado para el frontend
        $chartData = array_values($monthlyData);

        // Estadísticas generales
        $totalIncome = array_sum(array_column($chartData, 'income'));
        $totalAppointments = array_sum(array_column($chartData, 'appointments'));
        
        // Estadísticas por barbero (solo citas completadas y de barberos que existen actualmente)
        $barberStats = collect($allAppointments)
            ->where('status', 'completed')
            ->filter(function ($appointment) {
                return $appointment->barbero !== null;
            })
            ->groupBy('barbero_id')
            ->map(function ($appointments, $barberoId) {
                $barbero = $appointments->first()->barbero;
                return [
                    'id' => $barberoId,
                    'name' => $barbero->name,
                    'total' => $appointments->count()
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->all();

        // Identificar al barbero con más cortes
        $topBarber = !empty($barberStats) ? $barberStats[0] : null;

        return response()->json([
            'success' => true,
            'data' => [
                'chartData' => $chartData,
                'summary' => [
                    'totalIncome' => $totalIncome,
                    'totalAppointments' => $totalAppointments,
                    'cancelledAppointments' => $cancelledAppointmentsCount,
                    'barberStats' => $barberStats,
                    'topBarber' => $topBarber
                ]
            ]
        ]);
    }
}

