<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

        $tab = $request->get('tab', 'stock_in');

        $filters = [
            'date_from'  => $request->date_from,
            'date_to'    => $request->date_to,
            'product_id' => $request->product_id,
            'created_by' => $request->created_by,
        ];

        $data = $this->buildReportData($tab, $filters, paginate: true);

        return Inertia::render('Reports/Index', [
            'tab'     => $tab,
            'filters' => $filters,
            'rows'    => $data['rows'],      // paginator or simple collection
            'totals'  => $data['totals'],
            'footer'  => $data['footer'],
            'products'=> Product::orderBy('name')->get(['id','name','sku']),
            'users'   => User::orderBy('name')->get(['id','name']),
        ]);
    }

    /* -----------------------------------------------------
       CSV EXPORT — full dataset (no pagination)
    ------------------------------------------------------ */
    public function exportCsv(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

        $tab = $request->tab ?? 'stock_in';

        $filters = [
            'date_from'  => $request->date_from,
            'date_to'    => $request->date_to,
            'product_id' => $request->product_id,
            'created_by' => $request->created_by,
        ];

        // No pagination for export
        $data = $this->buildReportData($tab, $filters, paginate: false);
        $rows = $data['rows'];

        $filename = 'report_' . $tab . '_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($tab, $rows) {
            $out = fopen('php://output', 'w');

            if ($tab === 'inventory') {
                // Match inventory table in UI
                fputcsv($out, [
                    'Product',
                    'SKU',
                    'Barcode',
                    'Remaining Qty',
                    'Unit Price',
                    'Unit Sales Price',
                    'Total @ Price',
                    'Total @ Sales Price',
                ]);

                foreach ($rows as $row) {
                    fputcsv($out, [
                        $row['name'] ?? '',
                        $row['sku'] ?? '',
                        $row['barcode'] ?? '',
                        $row['remaining_qty'] ?? 0,
                        $row['unit_price'] ?? 0,
                        $row['unit_sales_price'] ?? 0,
                        $row['total_value'] ?? 0,
                        $row['total_value_sales'] ?? 0,
                    ]);
                }
            } elseif ($tab === 'sales_in') {
                // Match Sales In table
                fputcsv($out, [
                    'Product',
                    'SKU',
                    'Barcode',
                    'Qty',
                    'Unit Price',
                    'Unit Sales Price',
                    'Total Amount',
                    'Total Sale Amount',
                    'Date',
                    'By',
                    'Note',
                ]);

                foreach ($rows as $row) {
                    $p = $row['product'] ?? [];
                    fputcsv($out, [
                        $p['name'] ?? '',
                        $p['sku'] ?? '',
                        $p['barcode'] ?? '',
                        $row['quantity'] ?? 0,
                        $row['unit_price'] ?? 0,
                        $row['unit_sales_price'] ?? 0,
                        $row['amount'] ?? 0,
                        $row['sale_amount'] ?? 0,
                        $row['timestamp'] ?? '',
                        $row['user']['name'] ?? $row['created_by'] ?? '',
                        $row['note'] ?? '',
                    ]);
                }
            } elseif ($tab === 'sales_out') {
                // Match Sales Out table
                fputcsv($out, [
                    'Product',
                    'SKU',
                    'Barcode',
                    'Qty',
                    'Unit Price',
                    'Unit Sales Price',
                    'Effective Unit',
                    'Amount',
                    'Date',
                    'By',
                    'Note',
                ]);

                foreach ($rows as $row) {
                    $p = $row['product'] ?? [];
                    fputcsv($out, [
                        $p['name'] ?? '',
                        $p['sku'] ?? '',
                        $p['barcode'] ?? '',
                        $row['quantity'] ?? 0,
                        $row['unit_price'] ?? 0,
                        $row['unit_sales_price'] ?? 0,
                        $row['effective_unit'] ?? 0,
                        $row['amount'] ?? 0,
                        $row['timestamp'] ?? '',
                        $row['user']['name'] ?? $row['created_by'] ?? '',
                        $row['note'] ?? '',
                    ]);
                }
            } else {
                // stock_in and stock_out (no price columns in UI)
                fputcsv($out, [
                    'Product',
                    'SKU',
                    'Barcode',
                    'Qty',
                    'Date',
                    'By',
                    'Note',
                ]);

                foreach ($rows as $row) {
                    $p = $row['product'] ?? [];
                    fputcsv($out, [
                        $p['name'] ?? '',
                        $p['sku'] ?? '',
                        $p['barcode'] ?? '',
                        $row['quantity'] ?? 0,
                        $row['timestamp'] ?? '',
                        $row['user']['name'] ?? $row['created_by'] ?? '',
                        $row['note'] ?? '',
                    ]);
                }
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /* -----------------------------------------------------
       PDF EXPORT — full dataset
    ------------------------------------------------------ */
    public function exportPdf(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

        $tab = $request->tab ?? 'stock_in';

        $filters = [
            'date_from'  => $request->date_from,
            'date_to'    => $request->date_to,
            'product_id' => $request->product_id,
            'created_by' => $request->created_by,
        ];

        $data = $this->buildReportData($tab, $filters, paginate: false);

        $pdf = Pdf::loadView('reports.pdf', [
            'tab'     => $tab,
            'filters' => $filters,
            'rows'    => $data['rows'],   // same structure as UI
            'totals'  => $data['totals'],
            'footer'  => $data['footer'],
        ])->setPaper('A4', 'landscape');

        $filename = 'report_' . $tab . '_' . now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    /* -----------------------------------------------------
       PRINT VIEW — full dataset
    ------------------------------------------------------ */
    public function print(Request $request)
    {
        abort_unless(in_array(Auth::user()?->role, ['admin', 'staff', 'warehouse_manager']), 403);

        $tab = $request->tab ?? 'stock_in';

        $filters = [
            'date_from'  => $request->date_from,
            'date_to'    => $request->date_to,
            'product_id' => $request->product_id,
            'created_by' => $request->created_by,
        ];

        $data = $this->buildReportData($tab, $filters, paginate: false);

        return view('reports.print', [
            'tab'     => $tab,
            'filters' => $filters,
            'rows'    => $data['rows'],   // same as UI + CSV + PDF
            'totals'  => $data['totals'],
            'footer'  => $data['footer'],
        ]);
    }

    /* -----------------------------------------------------
       CORE REPORT BUILDER
    ------------------------------------------------------ */
    protected function buildReportData(string $tab, array $filters, bool $paginate = true): array
    {
        $dateFrom  = $filters['date_from'] ?: null;
        $dateTo    = $filters['date_to'] ?: null;
        $productId = $filters['product_id'] ?: null;
        $createdBy = $filters['created_by'] ?: null;

        /* ---------------------------------------------
           INVENTORY
        ---------------------------------------------- */
        if ($tab === 'inventory') {
            $query = Product::query()->orderBy('name');

            if ($paginate) {
                $paginator = $query->paginate(15)->withQueryString();
                $items = $paginator->getCollection();
            } else {
                $items = $query->get();
                $paginator = null;
            }

            $rows = $items->map(function (Product $product) {
                $in  = (int) StockIn::where('product_id', $product->id)->sum('quantity');
                $out = (int) StockOut::where('product_id', $product->id)->sum('quantity');

                $remaining = max($in - $out, 0);

                $price     = (float) $product->price;
                $salePrice = $product->sales_price !== null ? (float) $product->sales_price : null;

                $totalVal       = $remaining * $price;
                $totalValSales  = $remaining * ($salePrice !== null && $salePrice > 0 ? $salePrice : $price);

                return [
                    'id'                => $product->id,
                    'name'              => $product->name,
                    'sku'               => $product->sku,
                    'barcode'           => $product->barcode,
                    'remaining_qty'     => $remaining,
                    'price'             => $price,
                    'sales_price'       => $salePrice,
                    'unit_price'        => $price,
                    'unit_sales_price'  => $salePrice,
                    'total_value'       => $totalVal,
                    'total_value_sales' => $totalValSales,
                ];
            });

            $totals = [
                'total_products'        => $rows->count(),
                'remaining_qty'         => $rows->sum('remaining_qty'),
                'inventory_value'       => $rows->sum('total_value'),
                'inventory_value_sales' => $rows->sum('total_value_sales'),
            ];

            $footer = [
                'total_products'    => $rows->count(),
                'total_price'       => $rows->sum('unit_price'),
                'total_sales_price' => $rows->sum(fn($r) => $r['unit_sales_price'] ?? 0),
            ];

            if ($paginate) {
                $paginator->setCollection($rows);
                return [
                    'rows'   => $paginator,
                    'totals' => $totals,
                    'footer' => $footer,
                ];
            }

            return [
                'rows'   => $rows->values()->all(),
                'totals' => $totals,
                'footer' => $footer,
            ];
        }

        /* ---------------------------------------------
           STOCK IN + SALES IN
        ---------------------------------------------- */
        if ($tab === 'stock_in' || $tab === 'sales_in') {
            $query = StockIn::with(['product','creator','priceSnapshot']);

            if ($dateFrom) $query->whereDate('created_at','>=',$dateFrom);
            if ($dateTo)   $query->whereDate('created_at','<=',$dateTo);
            if ($productId) $query->where('product_id',$productId);
            if ($createdBy) $query->where('created_by',$createdBy);

            $collection = $paginate
                ? $query->orderByDesc('created_at')->paginate(15)->withQueryString()
                : $query->orderByDesc('created_at')->get();

            $items = $paginate ? $collection->getCollection() : $collection;

            $rows = $items->map(function (StockIn $r) use ($tab) {
                $qty = (int) $r->quantity;

                $unitPrice = (float) ($r->priceSnapshot->unit_price ?? $r->product->price ?? 0);
                $unitSale  = $r->priceSnapshot->unit_sales_price ?? $r->product->sales_price ?? null;

                $amount     = $qty * $unitPrice;
                $saleAmount = $unitSale ? $qty * (float) $unitSale : 0;

                return [
                    'id' => $r->id,
                    'product' => [
                        'id'          => $r->product->id,
                        'name'        => $r->product->name,
                        'sku'         => $r->product->sku,
                        'barcode'     => $r->product->barcode,
                        'price'       => $unitPrice,
                        'sales_price' => $unitSale,
                    ],
                    'quantity'         => $qty,
                    'unit_price'       => $unitPrice,
                    'unit_sales_price' => $unitSale !== null ? (float) $unitSale : null,
                    'amount'           => $tab === 'sales_in' ? $amount : 0,
                    'sale_amount'      => $tab === 'sales_in' ? $saleAmount : 0,
                    'timestamp'        => ($r->timestamp ?? $r->created_at)->format('Y-m-d H:i:s'),
                    'created_by'       => $r->created_by,
                    'user' => [
                        'id'   => $r->creator->id ?? null,
                        'name' => $r->creator->name ?? null,
                    ],
                    'note' => $r->note,
                ];
            });

            if ($paginate) {
                $collection->setCollection($rows);
            }

            return [
                'rows'   => $paginate ? $collection : $rows->values()->all(),
                'totals' => [
                    'qty'         => $rows->sum('quantity'),
                    'amount'      => $rows->sum('amount'),
                    'sale_amount' => $rows->sum('sale_amount'),
                ],
                'footer' => [
                    'total_products'    => $rows->pluck('product.id')->unique()->count(),
                    'total_price'       => $rows->sum('unit_price'),
                    'total_sales_price' => $rows->sum(fn($r) => $r['unit_sales_price'] ?? 0),
                ],
            ];
        }

        /* ---------------------------------------------
           STOCK OUT + SALES OUT
        ---------------------------------------------- */
        if ($tab === 'stock_out' || $tab === 'sales_out') {
            $query = StockOut::with(['product','creator','priceSnapshot']);

            if ($dateFrom) $query->whereDate('created_at','>=',$dateFrom);
            if ($dateTo)   $query->whereDate('created_at','<=',$dateTo);
            if ($productId) $query->where('product_id',$productId);
            if ($createdBy) $query->where('created_by',$createdBy);

            $collection = $paginate
                ? $query->orderByDesc('created_at')->paginate(15)->withQueryString()
                : $query->orderByDesc('created_at')->get();

            $items = $paginate ? $collection->getCollection() : $collection;

            $rows = $items->map(function (StockOut $r) use ($tab) {
                $qty = (int) $r->quantity;

                $unitPrice = (float) ($r->priceSnapshot->unit_price ?? $r->product->price ?? 0);
                $unitSale  = $r->priceSnapshot->unit_sales_price ?? $r->product->sales_price ?? null;

                $hasSale   = $unitSale && (float) $unitSale > 0 && (float) $unitSale !== $unitPrice;
                $effective = $hasSale ? (float) $unitSale : $unitPrice;

                $amount = $tab === 'sales_out' ? $qty * $effective : 0;

                return [
                    'id'       => $r->id,
                    'product' => [
                        'id'          => $r->product->id,
                        'name'        => $r->product->name,
                        'sku'         => $r->product->sku,
                        'barcode'     => $r->product->barcode,
                        'price'       => $unitPrice,
                        'sales_price' => $unitSale,
                    ],
                    'quantity'         => $qty,
                    'unit_price'       => $unitPrice,
                    'unit_sales_price' => $unitSale !== null ? (float) $unitSale : null,
                    'effective_unit'   => $effective,
                    'amount'           => $amount,
                    'timestamp'        => ($r->timestamp ?? $r->created_at)->format('Y-m-d H:i:s'),
                    'created_by'       => $r->created_by,
                    'user' => [
                        'id'   => $r->creator->id ?? null,
                        'name' => $r->creator->name ?? null,
                    ],
                    'note' => $r->note,
                ];
            });

            if ($paginate) {
                $collection->setCollection($rows);
            }

            return [
                'rows'   => $paginate ? $collection : $rows->values()->all(),
                'totals' => [
                    'qty'    => $rows->sum('quantity'),
                    'amount' => $rows->sum('amount'),
                ],
                'footer' => [
                    'total_products'    => $rows->pluck('product.id')->unique()->count(),
                    'total_price'       => $rows->sum('unit_price'),
                    'total_sales_price' => $rows->sum(fn($r) => $r['unit_sales_price'] ?? 0),
                ],
            ];
        }

        return [
            'rows'   => [],
            'totals' => [],
            'footer' => [],
        ];
    }
}
