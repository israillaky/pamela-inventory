<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use App\Models\Product;
use App\Models\ProductPriceSnapshot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogActivityTrait;
use Throwable;

class StockOutController extends Controller
{
    use LogActivityTrait;

    public function index(Request $request)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, [
                'admin', 'staff', 'warehouse_manager', 'cashier', 'warehouse_staff'
            ]), 403);

            // existing filters
            $filters = $request->only(['search', 'product_id', 'date_from', 'date_to']);

            // Default last 30 days if no date filters
            if (empty($filters['date_from']) && empty($filters['date_to'])) {
                $filters['date_to']   = now()->toDateString();
                $filters['date_from'] = now()->subDays(30)->toDateString();
            }

            // Base query with filters
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

            // Paginated results
            $stockOuts = (clone $baseQuery)
                ->latest('created_at')
                ->paginate(10)
                ->withQueryString();

            // Totals computation
            $all = (clone $baseQuery)->get();

            $saleSubtotal = 0.0;
            $regularSubtotal = 0.0;
            $totalQty = 0;

            foreach ($all as $r) {
                $qty = (int) $r->quantity;
                if ($qty <= 0) continue;

                $totalQty += $qty;

                $unitPrice = (float) (
                    optional($r->priceSnapshot)->unit_price
                    ?? optional($r->product)->price
                    ?? 0
                );

                $unitSaleRaw = (
                    optional($r->priceSnapshot)->unit_sales_price
                    ?? optional($r->product)->sales_price
                );

                $unitSale = $unitSaleRaw !== null ? (float) $unitSaleRaw : null;

                $hasSale = $unitSale !== null
                    && $unitSale > 0
                    && $unitSale !== $unitPrice;

                if ($hasSale) {
                    $saleSubtotal += $qty * $unitSale;
                } else {
                    $regularSubtotal += $qty * $unitPrice;
                }
            }

            $rangeTotals = [
                'saleSubtotal'    => $saleSubtotal,
                'regularSubtotal' => $regularSubtotal,
                'finalTotal'      => $saleSubtotal + $regularSubtotal,
                'totalQty'        => $totalQty,
            ];

            return Inertia::render('StockOut/Index', [
                'stockOuts'   => $stockOuts,
                'products'    => Product::orderBy('name')->get(['id','name','sku']),
                'filters'     => $filters,
                'rangeTotals' => $rangeTotals,
            ]);

        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to load Stock Out list.');
        }
    }

    public function store(Request $request)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, [
                'admin', 'staff', 'warehouse_manager', 'cashier', 'warehouse_staff'
            ]), 403);

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

            // Create snapshot
            ProductPriceSnapshot::create([
                'product_id'       => $product->id,
                'stock_in_id'      => null,
                'stock_out_id'     => $stockOut->id,
                'quantity'         => $stockOut->quantity,
                'unit_price'       => $product->price,
                'unit_sales_price' => $product->sales_price,
            ]);

            // Log activity
            $this->logActivity('stock_out', 'stock_out', [
                'product_id' => $stockOut->product_id,
                'quantity'   => $stockOut->quantity,
                'note'       => $stockOut->note,
                'id'         => $stockOut->id,
            ]);

            return back()->with('success', 'Stock Out added.');

        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to save Stock Out.');
        }
    }

    public function update(Request $request, StockOut $stockOut)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, [
                'admin', 'staff', 'warehouse_manager', 'warehouse_staff', 'cashier',
            ]), 403);

            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'quantity'   => ['required', 'integer', 'min:1'],
                'note'       => ['nullable', 'string', 'max:500'],
                'timestamp'  => ['nullable', 'date'],
            ]);

            // Update record
            $stockOut->update([
                'product_id' => $validated['product_id'],
                'quantity'   => $validated['quantity'],
                'note'       => $validated['note'] ?? null,
                'timestamp'  => $validated['timestamp'] ?? $stockOut->timestamp,
            ]);

            // Update snapshot
            $snapshot = ProductPriceSnapshot::where('stock_out_id', $stockOut->id)->first();
            if ($snapshot) {
                $snapshot->update([
                    'quantity' => $stockOut->quantity,
                ]);
            }

            $this->logActivity('updated', 'stock_out', [
                'product_id' => $stockOut->product_id,
                'quantity'   => $stockOut->quantity,
                'note'       => $stockOut->note,
                'id'         => $stockOut->id,
            ]);

            return back()->with('success', 'Stock Out updated.');

        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to update Stock Out.');
        }
    }

    public function destroy(Request $request, StockOut $stockOut)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, [
                'admin', 'staff', 'warehouse_manager', 'warehouse_staff'
            ]), 403);

            $this->logActivity('deleted', 'stock_out', [
                'product_id' => $stockOut->product_id,
                'quantity'   => $stockOut->quantity,
                'note'       => $stockOut->note,
                'id'         => $stockOut->id,
            ]);

            ProductPriceSnapshot::where('stock_out_id', $stockOut->id)->delete();

            $stockOut->delete();

            return back()->with('success', 'Stock Out deleted.');

        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to delete Stock Out.');
        }
    }

    public function searchProducts(Request $request)
    {
        try {
            abort_unless(in_array(Auth::user()?->role, [
                'admin', 'staff', 'warehouse_manager', 'cashier', 'warehouse_staff'
            ]), 403);

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

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Unable to search products.',
            ], 500);
        }
    }
}
