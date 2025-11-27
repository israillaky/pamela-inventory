<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogActivityTrait;


class StockOutController extends Controller
{
    use LogActivityTrait;

    public function index(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager','cashier']), 403);


        $filters = $request->only(['search', 'product_id', 'date_from', 'date_to']);

        $stockOuts = StockOut::with(['product'])
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
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('StockOut/Index', [
            'stockOuts' => $stockOuts,
            'filters' => $filters,
        ]);
    }

    // for dropdown / exact scan match
    public function searchProducts(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager','cashier']), 403);
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
            ->get(['id','name','sku','barcode','price']);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager','cashier']), 403);


        $validated = $request->validate([
            'product_id' => ['required','exists:products,id'],
            'quantity'   => ['required','integer','min:1'],
            'note'       => ['nullable','string','max:500'],
            'timestamp'  => ['nullable','date'],
        ]);

        // (optional) you can enforce "not exceed current stock" here later

        $stockOut = StockOut::create([
            'product_id' => $validated['product_id'],
            'quantity'   => $validated['quantity'],
            'note'       => $validated['note'] ?? null,
            'timestamp'  => $validated['timestamp'] ?? now(),
            'created_by' => Auth::id(),
        ]);

        $this->logActivity(
            'stock_out',
            'stock_out',
            [
                'product_id' => $stockOut->product_id,
                'quantity'   => $stockOut->quantity,
                'note'       => $stockOut->note,
                'id'         => $stockOut->id,
            ]
        );

        return back()->with('success', 'Stock Out added.');
    }

    public function update(Request $request, StockOut $stockOut)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);
        $validated = $request->validate([
            'product_id' => ['required','exists:products,id'],
            'quantity'   => ['required','integer','min:1'],
            'note'       => ['nullable','string','max:500'],
            'timestamp'  => ['nullable','date'],
        ]);

        $stockOut->update($validated);
        $this->logActivity(
            'updated',
            'stock_out',
            [
                'product_id' => $stockOut->product_id,
                'quantity'   => $stockOut->quantity,
                'note'       => $stockOut->note,
                'id'         => $stockOut->id,
            ]
        );

        return back()->with('success', 'Stock Out updated.');
    }

    public function destroy(StockOut $stockOut)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff','warehouse_manager']), 403);
        $this->logActivity(
            'deleted',
            'stock_out',
            [
                'product_id' => $stockOut->product_id,
                'quantity'   => $stockOut->quantity,
                'note'       => $stockOut->note,
                'id'         => $stockOut->id,
            ]
        );
        $stockOut->delete();

        return back()->with('success', 'Stock Out deleted.');
    }

}
