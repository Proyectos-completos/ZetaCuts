<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{

    public function index(Request $request)
    {
        $query = Review::with([
            'user:id,name',
            'barbero:id,name',
        ])->where('is_visible', true);

        if ($request->filled('barbero_id')) {
            $query->where('barbero_id', $request->get('barbero_id'));
        }

        $perPage = (int) $request->get('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 50) : 10;

        $reviews = $query
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'barbero_id' => 'required|exists:barberos,id',
            'rating' => ['required', 'numeric', 'between:1,5', function ($attribute, $value, $fail) {
                $scaled = $value * 2;
                if (abs($scaled - round($scaled)) > 0.001) {
                    $fail('La calificación debe ser múltiplo de 0.5');
                }
            }],
            'comment' => 'nullable|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $review = Review::create([
            'user_id' => $user->id,
            'barbero_id' => $data['barbero_id'],
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'is_visible' => true,
        ]);

        $review->load('user:id,name', 'barbero:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Reseña guardada correctamente',
            'data' => $review,
        ], 201);
    }

public function destroy(Request $request, Review $review)
    {
        $user = $request->user();

        if ($review->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para eliminar esta reseña',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reseña eliminada correctamente',
        ]);
    }
}

