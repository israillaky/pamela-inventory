<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\LogActivityTrait;
use Throwable;

class CategoryController extends Controller
{
    use LogActivityTrait;

    public function index(Request $request)
    {
        try {
            // Parents only live in categories table (children are in child_categories)
            // Don’t eager load child lists here (prevents huge JSON / memory crash)
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            $parents = Category::query()
                ->withCount('childCategories')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('Categories/Index', [
                'parents' => $parents,
            ]);
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to load categories.');
        }
    }

    public function children(Request $request, Category $category)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            return $category->childCategories()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->paginate(10);
        } catch (Throwable $e) {
            // children() is likely used via AJAX; handleException will return JSON if expectsJson()
            return $this->handleException($request, $e, 'Unable to load child categories.');
        }
    }

    public function store(Request $request)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            $validated = $request->validate([
                'name'      => 'required|string|max:255',
                'parent_id' => 'nullable|exists:categories,id',
            ]);

            $validated['created_by'] = Auth::id();

            $category = Category::create($validated);

            $this->logActivity(
                'created',
                'categories',
                "Created category: {$category->name} (ID: {$category->id})"
            );

            return back()->with('success', 'Category created.');
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to create category.');
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            $validated = $request->validate([
                'name'      => 'required|string|max:255',
                'parent_id' => 'nullable|exists:categories,id|not_in:' . $category->id,
            ]);

            $category->update($validated);

            $this->logActivity(
                'updated',
                'categories',
                "Updated category: {$category->name} (ID: {$category->id})"
            );

            return back()->with('success', 'Category updated.');
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to update category.');
        }
    }

    public function destroy(Request $request, Category $category)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            $this->logActivity(
                'deleted',
                'categories',
                "Deleted category: {$category->name} (ID: {$category->id})"
            );

            $category->delete();

            return back()->with('success', 'Category deleted.');
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to delete category.');
        }
    }
}
