<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ChildCategory;
use App\Traits\LogActivityTrait;

use App\Services\ProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    use LogActivityTrait;

    public function index(Request $request)
    {
         abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager','cashier']), 403);

        $filters = $request->only(['search', 'brand_id', 'category_id']);

        $products = Product::with(['brand','category','childCategory'])
            ->when($filters['search'] ?? null, function($q, $s){
                $q->where('name','like',"%$s%")
                  ->orWhere('sku','like',"%$s%")
                  ->orWhere('barcode','like',"%$s%");
            })
            ->when($filters['brand_id'] ?? null, fn($q,$id)=>$q->where('brand_id',$id))
            ->when($filters['category_id'] ?? null, fn($q,$id)=>$q->where('category_id',$id))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $products->getCollection()->transform(function ($p){
            $p->quantity = $p->quantity;
            $p->barcode_png = ProductService::barcodePng($p->barcode);
            return $p;
        });



        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $filters,
            'brands' => Brand::all(),
            'categories' => Category::with('childCategories')->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Form', [
            'mode' => 'create',
            'brands' => Brand::all(),
            'categories' => Category::with('childCategories')->get()
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'sku'                => 'nullable|string|unique:products,sku',
            'brand_id'           => 'required|exists:brands,id',
            'category_id'        => 'required|exists:categories,id',
            'child_category_id'  => 'nullable|exists:child_categories,id',
            'price'              => 'required|numeric|min:0',
            'sales_price'        => 'nullable|numeric|min:0',
        ]);

        $data['created_by'] = Auth::id();

        $product = Product::create($data);

        $this->logActivity(
            'created',
            'products',
            "Created product: {$product->name} (ID: {$product->id})"
        );

        return redirect()->route('products.index')
            ->with('success','Product created');
    }

    public function edit(Product $product)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $product->barcode_png = ProductService::barcodePng($product->barcode);

        return Inertia::render('Products/Form', [
            'mode' => 'edit',
            'product' => $product,
            'brands' => Brand::all(),
            'categories' => Category::with('childCategories')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $data = $request->validate([
            'name'               => 'required|string|max:255',
            'sku'                => 'required|string|unique:products,sku,' . $product->id,
            'brand_id'           => 'required|exists:brands,id',
            'category_id'        => 'required|exists:categories,id',
            'child_category_id'  => 'nullable|exists:child_categories,id',
            'price'              => 'required|numeric|min:0',
            'sales_price'        => 'nullable|numeric|min:0',
        ]);

        $product->update($data);
        $this->logActivity(
            'updated',
            'products',
            "Updated product: {$product->name} (ID: {$product->id})"
        );

        return redirect()->route('products.index')
            ->with('success','Product updated');
    }

    public function destroy(Product $product)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $this->logActivity(
            'deleted',
            'products',
            "Deleted product: {$product->name} (ID: {$product->id})"
        );

        $product->delete();
        return back()->with('success','Product deleted');
    }
}
