<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

// Servir archivos estáticos del frontend (CSS, JS, imágenes, etc.)
Route::get('/static/{path}', function ($path) {
    $filePath = public_path("frontend/static/{$path}");
    if (File::exists($filePath)) {
        $mimeType = File::mimeType($filePath);
        return response(File::get($filePath), 200)->header('Content-Type', $mimeType);
    }
    return response('File not found', 404);
})->where('path', '.*');

// Servir el index.html del frontend para todas las rutas que no sean API
Route::get('/{any}', function () {
    $path = public_path('frontend/index.html');
    if (file_exists($path)) {
        return response(File::get($path), 200)->header('Content-Type', 'text/html');
    }
    return response('Frontend not found', 404);
})->where('any', '^(?!api).*$');
