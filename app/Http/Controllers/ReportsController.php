<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ReportsController extends Controller
{
    /* ============================================
        MAIN REPORT PAGE
    ============================================ */
    public function index(Request $request)
    {
          // Admin + Staff only
        abort_unless(in_array(Auth::user()?->role, ['admin','staff', 'warehouse_manager']), 403);

        $filters = $request->only([
            'tab',
            'date_from',
            'date_to',
            'product_id',
            'created_by',
        ]);

        $tab = $filters['tab'] ?? 'stock_in';

        [
            $rows,
            $totals,
            $products,
            $users,
            $footer
        ] = $this->buildReport($filters, $tab);

        return Inertia::render('Reports/Index', [
            'tab'       => $tab,
            'filters'   => $filters,
            'rows'      => $rows,
            'totals'    => $totals,
            'footer'    => $footer,
            'products'  => $products,
            'users'     => $users,
        ]);
    }

    /* ============================================
        EXPORT: CSV
    ============================================ */
    public function exportCsv(Request $request): StreamedResponse
    {
         abort_unless(in_array(Auth::user()?->role, ['admin','staff', 'warehouse_manager']), 403);

        $filters = $request->only([
            'tab',
            'date_from',
            'date_to',
            'product_id',
            'created_by',
        ]);

        $tab = $filters['tab'] ?? 'stock_in';

        [$rows, $totals] = $this->buildReport($filters, $tab);

        $filename = "pamela-report-{$tab}-" . now()->format('YmdHis') . ".csv";

        $headers = [
            "Content-Type"        => "text/csv",
            "Content-Disposition" => "attachment; filename={$filename}",
        ];

        $callback = function () use ($rows, $tab) {
            $handle = fopen('php://output', 'w');

            /* ---------------------------
                INVENTORY TAB CSV
            ----------------------------*/
            if ($tab === 'inventory') {
                fputcsv($handle, [
                    'Product', 'SKU', 'Barcode', 'Remaining Qty',
                    'Price', 'Sales Price',
                    'Total Value (Price)', 'Total Value (Sales)',
                ]);

                foreach ($rows as $r) {
                    fputcsv($handle, [
                        $r['name'],
                        $r['sku'],
                        $r['barcode'],
                        $r['remaining_qty'],
                        $r['price'],
                        $r['sales_price'],
                        $r['total_value'],
                        $r['total_value_sales'],
                    ]);
                }
            }

            /* ---------------------------
                STOCK & SALES TABS CSV
            ----------------------------*/
            else {
                fputcsv($handle, [
                    'Date',
                    'Product',
                    'Quantity',
                    'Price',
                    'Amount',
                    'Created By',
                    'Note'
                ]);

                foreach ($rows as $r) {
                    $price = $r->product->price ?? 0;
                    fputcsv($handle, [
                        optional($r->timestamp)->format('Y-m-d H:i:s'),
                        optional($r->product)->name,
                        $r->quantity,
                        $price,
                        $r->quantity * $price,
                        $r->user->name ?? '-',
                        $r->note ?? '',
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /* ============================================
        EXPORT: PDF
    ============================================ */
    public function exportPdf(Request $request)
    {
         abort_unless(in_array(Auth::user()?->role, ['admin','staff', 'warehouse_manager']), 403);

        $filters = $request->only([
            'tab',
            'date_from',
            'date_to',
            'product_id',
            'created_by',
        ]);

        $tab = $filters['tab'] ?? 'stock_in';

        [$rows, $totals] = $this->buildReport($filters, $tab);

        $pdf = Pdf::loadView('reports.pdf', [
            'tab'         => $tab,
            'rows'        => $rows,
            'totals'      => $totals,
            'filters'     => $filters,
            'generated_at'=> now(),
        ]);

        return $pdf->download("pamela-report-{$tab}-" . now()->format('YmdHis') . ".pdf");
    }

    /* ============================================
        PRINT VIEW
    ============================================ */
    public function print(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff', 'warehouse_manager']), 403);

        $filters = $request->only([
            'tab',
            'date_from',
            'date_to',
            'product_id',
            'created_by',
        ]);

        $tab = $filters['tab'] ?? 'stock_in';

        [$rows, $totals] = $this->buildReport($filters, $tab);

        return view('reports.print', [
            'tab'         => $tab,
            'rows'        => $rows,
            'totals'      => $totals,
            'filters'     => $filters,
            'generated_at'=> now(),
        ]);
    }

    /* ============================================
        MAIN REPORT BUILDER (shared by all actions)
    ============================================ */
    private function buildReport(array $filters, string $tab)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin','staff', 'warehouse_manager']), 403);

        /* -------------------------
            PRODUCTS LIST
        --------------------------*/
        $products = Product::orderBy('name')
            ->get(['id','name','sku','barcode','price','sales_price']);

        /* -------------------------
            INVENTORY
        --------------------------*/
        $inventoryRows = Product::withSum('stockIns', 'quantity')
            ->withSum('stockOuts', 'quantity')
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                $in  = (int) ($p->stock_ins_sum_quantity ?? 0);
                $out = (int) ($p->stock_outs_sum_quantity ?? 0);
                $remain = $in - $out;

                return [
                    'id'                  => $p->id,
                    'name'                => $p->name,
                    'sku'                 => $p->sku,
                    'barcode'             => $p->barcode,
                    'price'               => (float) ($p->price ?? 0),
                    'sales_price'         => (float) ($p->sales_price ?? 0),
                    'remaining_qty'       => $remain,
                    'total_value'         => $remain * (float) ($p->price ?? 0),
                    'total_value_sales'   => $remain * (float) ($p->sales_price ?? 0),
                ];
            });

        /* -------------------------
            USERS LIST
        --------------------------*/
        $users = User::orderBy('name')->get(['id','name']);

        /* -------------------------
            FILTERED QUERIES
        --------------------------*/
        $stockInQuery = StockIn::with(['product', 'user'])
            ->when($filters['product_id'] ?? null, fn($q, $id) => $q->where('product_id', $id))
            ->when($filters['created_by'] ?? null, fn($q, $id) => $q->where('created_by', $id))
            ->when($filters['date_from'] ?? null, fn($q, $d) => $q->whereDate('timestamp', '>=', $d))
            ->when($filters['date_to'] ?? null, fn($q, $d) => $q->whereDate('timestamp', '<=', $d));

        $stockOutQuery = StockOut::with(['product', 'user'])
            ->when($filters['product_id'] ?? null, fn($q, $id) => $q->where('product_id', $id))
            ->when($filters['created_by'] ?? null, fn($q, $id) => $q->where('created_by', $id))
            ->when($filters['date_from'] ?? null, fn($q, $d) => $q->whereDate('timestamp', '>=', $d))
            ->when($filters['date_to'] ?? null, fn($q, $d) => $q->whereDate('timestamp', '<=', $d));

        /* -------------------------
            TAB OUTPUT
        --------------------------*/
        $rows = collect();
        $totals = [
            'qty'                  => 0,
            'amount'               => 0,
            'total_products'       => 0,
            'remaining_qty'        => 0,
            'inventory_value'      => 0,
            'inventory_value_sales'=> 0,
        ];

        if ($tab === 'stock_in') {
            $rows = $stockInQuery->latest()->get();
            $totals['qty'] = (int) $rows->sum('quantity');

            // ✅ ADD THIS so print/pdf totals work
            $totals['amount'] = (float) $rows->sum(fn($r) =>
                $r->quantity * ($r->product->price ?? 0)
            );
        }

        if ($tab === 'sales_in') {
            $rows = $stockInQuery->latest()->get();
            $totals['qty'] = $rows->sum('quantity');
            $totals['amount'] = $rows->sum(fn($r) =>
                $r->quantity * ($r->product->price ?? 0)
            );
        }

        if ($tab === 'stock_out') {
            $rows = $stockOutQuery->latest()->get();
            $totals['qty'] = (int) $rows->sum('quantity');

            // ✅ ADD THIS so print/pdf totals work
            $totals['amount'] = (float) $rows->sum(fn($r) =>
                $r->quantity * ($r->product->price ?? 0)
            );
        }

        if ($tab === 'sales_out') {
            $rows = $stockOutQuery->latest()->get();
            $totals['qty'] = $rows->sum('quantity');
            $totals['amount'] = $rows->sum(fn($r) =>
                $r->quantity * ($r->product->price ?? 0)
            );
        }

        if ($tab === 'inventory') {
            $rows = $inventoryRows;

            $totals['total_products']       = $rows->count();
            $totals['remaining_qty']        = $rows->sum('remaining_qty');
            $totals['inventory_value']      = $rows->sum('total_value');
            $totals['inventory_value_sales']= $rows->sum('total_value_sales');
        }

        /* -------------------------
            FOOTER DATA
        --------------------------*/
        $footer = [
            'total_products'     => $products->count(),
            'total_price'        => (float) $products->sum('price'),
            'total_sales_price'  => (float) $products->sum('sales_price'),
        ];

        return [
            $rows,
            $totals,
            $products,
            $users,
            $footer
        ];
    }
}
