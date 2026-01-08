<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{

    public function index(Request $request)
    {
        $query = Product::query();

        $isAdmin = $request->user()?->isAdmin() ?? false;

        if (!$isAdmin || !$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('brand')) {
            $query->where('brand', $request->brand);
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        $allowedSortFields = ['name', 'price', 'created_at'];
        $sortBy = in_array($request->get('sort_by'), $allowedSortFields) ? $request->get('sort_by') : 'name';
        $sortDirection = $request->get('sort_direction') === 'desc' ? 'desc' : 'asc';

        $perPage = (int) $request->get('per_page', 12);
        $perPage = $perPage > 0 ? min($perPage, 50) : 12;

        $products = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->appends($request->query());

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

public function show(Request $request, $id)
    {
        try {
            $isAdmin = $request->user()?->isAdmin() ?? false;

            $productQuery = Product::query();

            if (!$isAdmin) {
                $productQuery->where('is_active', true);
            }

            // Si es numérico, buscar por ID, si no, buscar por slug
            if (is_numeric($id)) {
                $product = $productQuery->where('id', (int)$id)->first();
            } else {
                $product = $productQuery->where('slug', $id)->first();
            }

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Producto no encontrado',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $product,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en ProductController@show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar el producto',
            ], 500);
        }
    }

public function store(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'image_url' => 'nullable|url',
            'purchase_url' => 'nullable|url',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string|url',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if (empty($data['slug'])) {
            $data['slug'] = $this->generateSlug($data['name']);
        }

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'data' => $product,
        ], 201);
    }

public function update(Request $request, Product $product)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'category' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'image_url' => 'nullable|url',
            'purchase_url' => 'nullable|url',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string|url',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if (isset($data['name']) && empty($data['slug']) && $product->name !== $data['name']) {
            $data['slug'] = $this->generateSlug($data['name']);
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'data' => $product->fresh(),
        ]);
    }

public function destroy(Request $request, Product $product)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción',
            ], 403);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado exitosamente',
        ]);
    }

    private function generateSlug(string $name): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}

