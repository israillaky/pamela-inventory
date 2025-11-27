<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\LogActivityTrait;


class BrandController extends Controller
{
    use LogActivityTrait;
    public function index(Request $request)
    {

        // View allowed for all authenticated roles
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $search = $request->get('search');

        $brands = Brand::query()
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Brands/Index', [
            'brands' => $brands,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        // Admin only
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);


        $validated = $request->validate([
            'name' => ['required','string','max:255','unique:brands,name'],
        ]);

        $brand = Brand::create([
            'name' => $validated['name'],
            'created_by' => Auth::id(),
        ]);
        $this->logActivity(
            'created',
            'brands',
            "Created brand: {$brand->name} (ID: {$brand->id})"
        );

        return back()->with('success', 'Brand created.');
    }

    public function update(Request $request, Brand $brand)
    {
        // Admin only
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $validated = $request->validate([
            'name' => ['required','string','max:255','unique:brands,name,' . $brand->id],
        ]);

        $brand->update([
            'name' => $validated['name'],
        ]);

        $this->logActivity(
            'updated',
            'brands',
            "Updated brand: {$brand->name} (ID: {$brand->id})"
        );

        return back()->with('success', 'Brand updated.');
    }

    public function destroy(Brand $brand)
    {
        // Admin only
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $this->logActivity(
            'deleted',
            'brands',
            "Deleted brand: {$brand->name} (ID: {$brand->id})"
        );

        $brand->delete();

        return back()->with('success', 'Brand deleted.');
    }
}
