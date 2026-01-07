<?php

namespace App\Exceptions;

use Exception;

/**
 * Excepción personalizada para errores relacionados con citas
 * 
 * Se utiliza para manejar errores específicos del dominio de citas,
 * como conflictos de horarios, puntos insuficientes, etc.
 */
class AppointmentException extends Exception
{
    /**
     * Código de error para conflicto de horario
     */
    const CODE_SCHEDULE_CONFLICT = 4001;

    /**
     * Código de error para puntos insuficientes
     */
    const CODE_INSUFFICIENT_POINTS = 4002;

    /**
     * Código de error para fecha inválida
     */
    const CODE_INVALID_DATE = 4003;

    /**
     * Código de error para hora inválida
     */
    const CODE_INVALID_TIME = 4004;

    /**
     * Renderiza la excepción como respuesta HTTP JSON
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => $this->getCode(),
        ], 400);
    }
}

