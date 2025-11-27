<?php

namespace App\Http\Controllers;

use App\Models\ChildCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogActivityTrait;

class ChildCategoryController extends Controller
{
    use LogActivityTrait;

    public function store(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $childCategory = ChildCategory::create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'created_by' => Auth::id(),
        ]);

        $this->logActivity(
            'created',
            'categories',
            "Created child category: {$childCategory->name} (ID: {$childCategory->id})"
        );


        return back()->with('success', 'Child category created.');
    }

    public function update(Request $request, ChildCategory $childCategory)
    {
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
    }

    public function destroy(ChildCategory $childCategory)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $this->logActivity(
            'deleted',
            'categories',
            "Deleted child category: {$childCategory->name} (ID: {$childCategory->id})"
        );

        $childCategory->delete();

        return back()->with('success', 'Child category deleted.');
    }
}
