<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BarberoController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\StatsController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/barberos/available', [AppointmentController::class, 'getBarberos']);
Route::get('/appointments/slots/available', [AppointmentController::class, 'getAvailableSlots']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{productIdOrSlug}', [ProductController::class, 'show']);

Route::get('/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{appointment}', [AppointmentController::class, 'update']);
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
    
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::put('/profile/email', [UserController::class, 'updateEmail']);
    Route::get('/points', [UserController::class, 'points']);
    Route::get('/notifications/user', [UserController::class, 'notifications']);
    Route::put('/notifications/user/{id}/read', [UserController::class, 'markNotificationAsRead']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    Route::get('/barberos', [BarberoController::class, 'index']);
    Route::post('/barberos', [BarberoController::class, 'store']);
    Route::get('/barberos/{barbero}', [BarberoController::class, 'show']);
    Route::put('/barberos/{barbero}', [BarberoController::class, 'update']);
    Route::delete('/barberos/{barbero}', [BarberoController::class, 'destroy']);
    Route::get('/barberos/{barbero}/appointments', [BarberoController::class, 'getAppointments']);
    
    Route::get('/stats/market-study', [StatsController::class, 'getMarketStudy']);
    
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'getUnread']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
}); 