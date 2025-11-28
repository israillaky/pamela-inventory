<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use App\Models\Product;
use App\Models\ProductPriceSnapshot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogActivityTrait;

class StockOutController extends Controller
{
    use LogActivityTrait;

    public function index(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

        // existing filters
        $filters = $request->only(['search', 'product_id', 'date_from', 'date_to']);

        // Default last 30 days if no date filters
        if (empty($filters['date_from']) && empty($filters['date_to'])) {
            $filters['date_to']   = now()->toDateString();                 // today
            $filters['date_from'] = now()->subDays(30)->toDateString();    // 30 days ago
        }

        // Base query with filters (used for both pagination and totals)
        $baseQuery = StockOut::with(['product', 'creator', 'priceSnapshot'])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('product', fn($pq) =>
                    $pq->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                );
            })
            ->when($filters['product_id'] ?? null, fn($q, $pid) => $q->where('product_id', $pid))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to));

        // Paginated list (current page)
        $stockOuts = (clone $baseQuery)
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString();

        // Full list for the selected range (no pagination) -> compute totals for last 30 days
        $allForTotals = (clone $baseQuery)->get();

        $saleSubtotal = 0.0;
        $regularSubtotal = 0.0;
        $totalQty = 0;

        foreach ($allForTotals as $r) {
            $qty = (int) $r->quantity;
            if ($qty <= 0) {
                continue;
            }
            $totalQty += $qty;  // 👈 NEW
            // same logic as your React helpers
            $unitPrice = (float) (
                optional($r->priceSnapshot)->unit_price
                ?? optional($r->product)->price
                ?? 0
            );

            $unitSaleValue = (
                optional($r->priceSnapshot)->unit_sales_price
                ?? optional($r->product)->sales_price
            );
            $unitSales = $unitSaleValue !== null ? (float) $unitSaleValue : null;

            $hasSale = $unitSales !== null
                && $unitSales > 0
                && $unitSales !== $unitPrice;

            if ($hasSale) {
                $saleSubtotal += $qty * $unitSales;
            } else {
                $regularSubtotal += $qty * $unitPrice;
            }
        }

        $rangeTotals = [
            'saleSubtotal'    => $saleSubtotal,
            'regularSubtotal' => $regularSubtotal,
            'finalTotal'      => $saleSubtotal + $regularSubtotal,
            'totalQty'        => $totalQty,          // 👈 NEW
        ];

        return Inertia::render('StockOut/Index', [
            'stockOuts'    => $stockOuts,
            'products'     => Product::orderBy('name')->get(['id','name','sku']),
            'filters'      => $filters,
            'rangeTotals'  => $rangeTotals, // ⬅️ new
        ]);
    }


    public function store(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
            'note'       => ['nullable', 'string', 'max:500'],
            'timestamp'  => ['nullable', 'date'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $stockOut = StockOut::create([
            'product_id' => $product->id,
            'quantity'   => $validated['quantity'],
            'note'       => $validated['note'] ?? null,
            'timestamp'  => $validated['timestamp'] ?? now(),
            'created_by' => Auth::id(),
        ]);

        ProductPriceSnapshot::create([
            'product_id'       => $product->id,
            'stock_in_id'      => null,
            'stock_out_id'     => $stockOut->id,
            'quantity'         => $stockOut->quantity,
            'unit_price'       => $product->price,
            'unit_sales_price' => $product->sales_price,
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
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
            'note'       => ['nullable', 'string', 'max:500'],
            'timestamp'  => ['nullable', 'date'],
        ]);

        $stockOut->update([
            'product_id' => $validated['product_id'],
            'quantity'   => $validated['quantity'],
            'note'       => $validated['note'] ?? null,
            'timestamp'  => $validated['timestamp'] ?? $stockOut->timestamp,
        ]);

        // keep snapshot quantity in sync
        $snapshot = ProductPriceSnapshot::where('stock_out_id', $stockOut->id)->first();
        if ($snapshot) {
            $snapshot->update([
                'quantity' => $stockOut->quantity,
            ]);
        }

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
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

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

        ProductPriceSnapshot::where('stock_out_id', $stockOut->id)->delete();

        $stockOut->delete();

        return back()->with('success', 'Stock Out deleted.');
    }

    public function searchProducts(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

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
