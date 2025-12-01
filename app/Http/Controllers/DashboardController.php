<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $role = Auth::user()->role;
        $userId = Auth::id();

        abort_unless(in_array($role, ['admin','staff','warehouse_manager','cashier', 'warehouse_staff']), 403);

        /* ============================================================
            ROLE LOGIC
           ============================================================ */

        if ($role === 'cashier') {
            // Cashier sees only their own Stock Out data

            $stockOutBase = StockOut::where('created_by', $userId);

            $totalStockOutQty = $stockOutBase->sum('quantity');

            $totalSalesOut = $stockOutBase
                ->with('product:id,price')
                ->get()
                ->sum(fn($row) => (float)$row->quantity * (float)($row->product->price ?? 0));

            // Graph (last 7 days only their data)
            $graphDays = collect(range(6, 0))->map(fn($i) => now()->subDays($i)->toDateString());

            $stockOutSeries = $stockOutBase
                ->whereDate('created_at', '>=', now()->subDays(6))
                ->selectRaw('DATE(created_at) as day, SUM(quantity) as qty')
                ->groupBy('day')
                ->pluck('qty', 'day');

            $graphData = $graphDays->map(fn($day) => [
                'day' => $day,
                'stock_out' => (int)($stockOutSeries[$day] ?? 0),
            ])->values();

            return Inertia::render('Dashboard/Index', [
                'totals' => [
                    // Cashier sees ONLY stock out totals
                    'stock_in_qty' => 0,
                    'sales_in' => 0,
                    'stock_out_qty' => (int)$totalStockOutQty,
                    'sales_out' => (float)$totalSalesOut,
                    'products' => 0,
                    'inventory_value' => 0,
                    'inventory_value_sales' => 0,
                ],
                'graphData' => $graphData,
            ]);
        }


        /* ============================================================
            ADMIN + STAFF + WAREHOUSE MANAGER
            (full view, global totals)
           ============================================================ */

        $totalStockInQty = StockIn::sum('quantity');
        $totalStockOutQty = StockOut::sum('quantity');

        $totalSalesIn = StockIn::with('product:id,price,sales_price')
            ->get()
            ->sum(fn($r) => (float)$r->quantity * (float)($r->product->price ?? 0));

        $totalSalesOut = StockOut::with('product:id,price,sales_price')
            ->get()
            ->sum(fn($r) => (float)$r->quantity * (float)($r->product->price ?? 0));

        $products = Product::with([
            'stockIns:id,product_id,quantity',
            'stockOuts:id,product_id,quantity'
        ])->get(['id','price','sales_price']);

        $totalProducts = $products->count();

        $totalInventoryValue = $products->sum(function ($p) {
            $qty = $p->stockIns->sum('quantity') - $p->stockOuts->sum('quantity');
            return $qty * (float)($p->price ?? 0);
        });

        $totalInventoryValueSalesPrice = $products->sum(function ($p) {
            $qty = $p->stockIns->sum('quantity') - $p->stockOuts->sum('quantity');
            $sell = $p->sales_price ?? $p->price;
            return $qty * (float)$sell;
        });

        // Full graph (global)
        $graphDays = collect(range(6, 0))->map(fn($i) => now()->subDays($i)->toDateString());

        $stockOutSeries = StockOut::whereDate('created_at', '>=', now()->subDays(6))
            ->selectRaw('DATE(created_at) as day, SUM(quantity) as qty')
            ->groupBy('day')
            ->pluck('qty', 'day');

        $graphData = $graphDays->map(fn($day) => [
            'day' => $day,
            'stock_out' => (int)($stockOutSeries[$day] ?? 0),
        ])->values();

        return Inertia::render('Dashboard/Index', [
            'totals' => [
                'stock_in_qty'       => (int)$totalStockInQty,
                'sales_in'           => (float)$totalSalesIn,
                'stock_out_qty'      => (int)$totalStockOutQty,
                'sales_out'          => (float)$totalSalesOut,
                'products'           => (int)$totalProducts,
                'inventory_value'    => (float)$totalInventoryValue,
                'inventory_value_sales' => (float)$totalInventoryValueSalesPrice,
            ],
            'graphData' => $graphData,
        ]);
    }
}
