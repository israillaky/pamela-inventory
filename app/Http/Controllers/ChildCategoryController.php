<?php

namespace App\Http\Controllers;

use App\Models\ChildCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogActivityTrait;
use Throwable;

class ChildCategoryController extends Controller
{
    use LogActivityTrait;

    public function store(Request $request)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            $data = $request->validate([
                'category_id' => ['required', 'exists:categories,id'],
                'name'        => ['required', 'string', 'max:255'],
            ]);

            $childCategory = ChildCategory::create([
                'category_id' => $data['category_id'],
                'name'        => $data['name'],
                'created_by'  => Auth::id(),
            ]);

            $this->logActivity(
                'created',
                'categories',
                "Created child category: {$childCategory->name} (ID: {$childCategory->id})"
            );

            return back()->with('success', 'Child category created.');
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to create child category.');
        }
    }

    public function update(Request $request, ChildCategory $childCategory)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
            ]);

            $childCategory->update([
                'name' => $data['name'],
            ]);

            $this->logActivity(
                'updated',
                'categories',
                "Updated child category: {$childCategory->name} (ID: {$childCategory->id})"
            );

            return back()->with('success', 'Child category updated.');
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to update child category.');
        }
    }

    public function destroy(Request $request, ChildCategory $childCategory)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

            $this->logActivity(
                'deleted',
                'categories',
                "Deleted child category: {$childCategory->name} (ID: {$childCategory->id})"
            );

            $childCategory->delete();

            return back()->with('success', 'Child category deleted.');
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to delete child category.');
        }
    }
}
