<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{

    public function index(): JsonResponse
    {
        try {
            $notifications = Notification::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las notificaciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'notification_id' => 'required|exists:notifications,id'
            ]);

            $notification = Notification::find($request->notification_id);
            $notification->update(['read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Notificación marcada como leída'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar la notificación como leída',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAllAsRead(): JsonResponse
    {
        try {
            Notification::where('read', false)->update(['read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Todas las notificaciones marcadas como leídas'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar las notificaciones como leídas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUnread(): JsonResponse
    {
        try {
            $unreadNotifications = Notification::where('read', false)
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info('Notificaciones no leídas obtenidas', [
                'count' => $unreadNotifications->count(),
                'notifications' => $unreadNotifications->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'unread_notifications' => $unreadNotifications,
                    'count' => $unreadNotifications->count()
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error obteniendo notificaciones no leídas', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las notificaciones no leídas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
