<?php

namespace App\Http\Controllers;

use App\Models\StockIn;
use App\Models\Product;
use App\Models\ProductPriceSnapshot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogActivityTrait;

class StockInController extends Controller
{
    use LogActivityTrait;

    public function index(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $filters = $request->only(['search', 'product_id', 'date_from', 'date_to']);

        $stockIns = StockIn::with(['product', 'creator', 'priceSnapshot'])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('product', fn($pq) =>
                    $pq->where('name', 'like', "%{$search}%")
                       ->orWhere('sku', 'like', "%{$search}%")
                       ->orWhere('barcode', 'like', "%{$search}%")
                );
            })
            ->when($filters['product_id'] ?? null, fn($q, $pid) => $q->where('product_id', $pid))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->latest('created_at') // use your logical stock date
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('StockIn/Index', [
            'stockIns' => $stockIns,
            'products' => Product::orderBy('name')->get(['id','name','sku']),
            'filters'  => $filters,
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $validated = $request->validate([
            'product_id' => ['required','exists:products,id'],
            'quantity'   => ['required','integer','min:1'],
            'note'       => ['nullable','string','max:500'],
            'timestamp'  => ['nullable','date'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $stockIn = StockIn::create([
            'product_id' => $product->id,
            'quantity'   => $validated['quantity'],
            'note'       => $validated['note'] ?? null,
            'timestamp'  => $validated['timestamp'] ?? now(),
            'created_by' => Auth::id(),
        ]);

        // Create price snapshot for this Stock In
        ProductPriceSnapshot::create([
            'product_id'       => $product->id,
            'stock_in_id'      => $stockIn->id,
            'stock_out_id'     => null,
            'quantity'         => $stockIn->quantity,
            'unit_price'       => $product->price,
            'unit_sales_price' => $product->sales_price, // can be null if not set
        ]);

        $this->logActivity(
            'stock_in',
            'stock_in',
            [
                'product_id' => $stockIn->product_id,
                'quantity'   => $stockIn->quantity,
                'note'       => $stockIn->note,
                'id'         => $stockIn->id,
            ]
        );

        return back()->with('success', 'Stock In added.');
    }

    public function update(Request $request, StockIn $stockIn)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $validated = $request->validate([
            'product_id' => ['required','exists:products,id'],
            'quantity'   => ['required','integer','min:1'],
            'note'       => ['nullable','string','max:500'],
            'timestamp'  => ['nullable','date'],
        ]);

        $stockIn->update([
            'product_id' => $validated['product_id'],
            'quantity'   => $validated['quantity'],
            'note'       => $validated['note'] ?? null,
            'timestamp'  => $validated['timestamp'] ?? $stockIn->timestamp,
        ]);

        // Keep the snapshot quantity in sync with the Stock In
        $snapshot = ProductPriceSnapshot::where('stock_in_id', $stockIn->id)->first();
        if ($snapshot) {
            $snapshot->update([
                'quantity' => $stockIn->quantity,
            ]);
        }

        $this->logActivity(
            'updated',
            'stock_in',
            [
                'product_id' => $stockIn->product_id,
                'quantity'   => $stockIn->quantity,
                'note'       => $stockIn->note,
                'id'         => $stockIn->id,
            ]
        );

        return back()->with('success', 'Stock In updated.');
    }

    public function destroy(StockIn $stockIn)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $this->logActivity(
            'deleted',
            'stock_in',
            [
                'product_id' => $stockIn->product_id,
                'quantity'   => $stockIn->quantity,
                'note'       => $stockIn->note,
                'id'         => $stockIn->id,
            ]
        );

        // Remove related snapshot to avoid orphan records
        ProductPriceSnapshot::where('stock_in_id', $stockIn->id)->delete();

        $stockIn->delete();

        return back()->with('success', 'Stock In deleted.');
    }

    public function searchProducts(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);

        $q = trim($request->get('q', ''));

        if ($q === '') {
            return response()->json([]);
        }

        $products = Product::query()
            ->where('barcode', 'like', "%{$q}%")
            ->orWhere('sku', 'like', "%{$q}%")
            ->orWhere('name', 'like', "%{$q}%")
            ->orderBy('name')
            ->limit(10)
            ->get(['id','name','sku','barcode','price','sales_price']);

        return response()->json($products);
    }
}
