<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Print — {{ ucfirst(str_replace('_', ' ', $tab)) }} Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 14px;
            color: #111827;
            margin: 16px;
        }
        h1, h2, h3 {
            margin: 0 0 4px 0;
        }
        .small {
            font-size: 12px;
            color: #6b7280;
        }
        .muted {
            color: #6b7280;
        }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }

        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 8px;
            page-break-inside: auto;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 4px 6px;
        }
        th {
            background-color: #f9fafb;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
        }
        td {
            font-size: 12px;
        }
        tfoot td {
            font-size: 12px;
        }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 600; }
        .border-top {
            border-top: 2px solid #d1d5db;
        }

        @media print {
            body {
                margin: 8px;
            }
            .no-print {
                display: none;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            thead tr {
                background-color: ##f9fafb !important;
                color: #333 !important;
            }

            th {
                background-color: ##f9fafb !important;
                color: #333 !important;
            }

            tfoot tr {
                background-color: #f9fafb !important;
                color: #333 !important;
                font-weight: 600 !important;
            }

            tfoot td {
                border-top: 2px solid #1f2937 !important;
            }

            /* optional: improves print clarity */
            table, th, td {
                border-color: #d1d5db !important;
            }
        }
    </style>
</head>
<body>
@php
    $money = function ($v) {
        $n = is_null($v) ? 0 : (float) $v;
        return number_format($n, 2);
    };
@endphp

    <div class="no-print" style="margin-bottom: 10px;">
        <button onclick="window.print();" style="padding:4px 8px;font-size:12px;">
            Print
        </button>
    </div>

    <h1>Pamela's Online Shop</h1>
    <h2>Report — {{ ucfirst(str_replace('_', ' ', $tab)) }}</h2>

    {{-- Filters summary --}}
    <div class="mb-3 small">
        @if (!empty($filters['date_from']) || !empty($filters['date_to']))
            <div class="mb-1">
                <span class="font-bold">Date Range:</span>
                {{ $filters['date_from'] ?? '—' }} &rarr; {{ $filters['date_to'] ?? '—' }}
            </div>
        @endif

        @if (!empty($filters['product_id']))
            <div class="mb-1">
                <span class="font-bold">Product ID:</span> {{ $filters['product_id'] }}
            </div>
        @endif
    </div>

    {{-- MAIN TABLE (same logic as pdf) --}}
    @if ($tab === 'inventory')
        <table>
            <thead>
                <tr>
                    <th class="text-left">Product</th>
                    <th class="text-right">Remaining Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Sales Price</th>
                    <th class="text-right">Total @ Price</th>
                    <th class="text-right">Total @ Sales Price</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    <tr>
                        <td>{{ $row['name'] ?? '' }}</td>
                        <td class="text-right">{{ $row['remaining_qty'] ?? 0 }}</td>
                        <td class="text-right">₱{{ $money($row['unit_price'] ?? $row['price'] ?? 0) }}</td>
                        <td class="text-right">
                            @if (!empty($row['unit_sales_price']))
                                ₱{{ $money($row['unit_sales_price']) }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-right">₱{{ $money($row['total_value'] ?? 0) }}</td>
                        <td class="text-right">₱{{ $money($row['total_value_sales'] ?? 0) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center muted">No records found.</td>
                    </tr>
                @endforelse
            </tbody>
            @if (!empty($rows))
                <tfoot>
                    <tr class="border-top">
                        <td class="text-right font-bold">Totals:</td>
                        <td class="text-right font-bold">{{ $totals['remaining_qty'] ?? 0 }}</td>
                        <td class="text-right font-bold">₱{{ $money($footer['total_price'] ?? 0) }}</td>
                        <td class="text-right font-bold">₱{{ $money($footer['total_sales_price'] ?? 0) }}</td>
                        <td class="text-right font-bold">₱{{ $money($totals['inventory_value'] ?? 0) }}</td>
                        <td class="text-right font-bold">₱{{ $money($totals['inventory_value_sales'] ?? 0) }}</td>
                    </tr>
                </tfoot>
            @endif
        </table>

    @elseif ($tab === 'sales_in')
        <table>
            <thead>
                <tr>
                    <th class="text-left">Product</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Sales Price</th>
                    <th class="text-right">Total Amount</th>
                    <th class="text-right">Total Sale Amount</th>
                    <th class="text-left">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    @php $p = $row['product'] ?? []; @endphp
                    <tr>
                        <td>{{ $p['name'] ?? '' }}</td>
                        <td class="text-right">{{ $row['quantity'] ?? 0 }}</td>
                        <td class="text-right">₱{{ $money($row['unit_price'] ?? 0) }}</td>
                        <td class="text-right">
                            @if (!empty($row['unit_sales_price']))
                                ₱{{ $money($row['unit_sales_price']) }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-right">₱{{ $money($row['amount'] ?? 0) }}</td>
                        <td class="text-right">₱{{ $money($row['sale_amount'] ?? 0) }}</td>
                        <td>{{ date('M d, Y', strtotime($row['timestamp'] ?? '')) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="11" class="text-center muted">No records found.</td>
                    </tr>
                @endforelse
            </tbody>
            @if (!empty($rows))
                <tfoot>
                    <tr class="border-top">
                        <td  class="text-right font-bold">Totals:</td>
                        <td class="text-right font-bold">{{ $totals['qty'] ?? 0 }}</td>
                        <td class="text-right"></td>
                        <td class="text-right"></td>
                        <td class="text-right font-bold">₱{{ $money($totals['amount'] ?? 0) }}</td>
                        <td class="text-right font-bold">₱{{ $money($totals['sale_amount'] ?? 0) }}</td>
                        <td colspan="1"></td>
                    </tr>
                </tfoot>
            @endif
        </table>

    @elseif ($tab === 'sales_out')
        <table>
            <thead>
                <tr>
                    <th class="text-left">Product</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Sales Price</th>
                    <th class="text-right">Effective Unit</th>
                    <th class="text-right">Amount</th>
                    <th class="text-left">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    @php $p = $row['product'] ?? []; @endphp
                    <tr>
                        <td>{{ $p['name'] ?? '' }}</td>
                        <td class="text-right">{{ $row['quantity'] ?? 0 }}</td>
                        <td class="text-right">₱{{ $money($row['unit_price'] ?? 0) }}</td>
                        <td class="text-right">
                            @if (!empty($row['unit_sales_price']))
                                ₱{{ $money($row['unit_sales_price']) }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-right">₱{{ $money($row['effective_unit'] ?? 0) }}</td>
                        <td class="text-right">₱{{ $money($row['amount'] ?? 0) }}</td>
                        <td >{{ date('M d, Y', strtotime($row['timestamp'] ?? '')) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="11" class="text-center muted">No records found.</td>
                    </tr>
                @endforelse
            </tbody>
            @if (!empty($rows))
                <tfoot>
                    <tr class="border-top">
                        <td  class="text-right font-bold">Total:</td>
                        <td class="text-right font-bold">{{ $totals['qty'] ?? 0 }}</td>
                        <td class="text-right"></td>
                        <td class="text-right"></td>
                        <td class="text-right"></td>
                        <td class="text-right font-bold">₱{{ $money($totals['amount'] ?? 0) }}</td>
                        <td colspan="1"></td>
                    </tr>
                </tfoot>
            @endif
        </table>

    @else
        {{-- STOCK IN / STOCK OUT --}}
        <table>
            <thead>
                <tr>
                    <th class="text-left">Product</th>
                    <th class="text-right">Qty</th>
                    <th >Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    @php $p = $row['product'] ?? []; @endphp
                    <tr>
                        <td>{{ $p['name'] ?? '' }}</td>
                        <td class="text-right">{{ $row['quantity'] ?? 0 }}</td>
                        <td >{{ date('M d, Y', strtotime($row['timestamp'] ?? '')) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center muted">No records found.</td>
                    </tr>
                @endforelse
            </tbody>
            @if (!empty($rows))
                <tfoot>
                    <tr class="border-top">
                        <td  class="text-right font-bold">Total Qty:</td>
                        <td class="text-right font-bold">{{ $totals['qty'] ?? 0 }}</td>
                        <td colspan="1"></td>
                    </tr>
                </tfoot>
            @endif
        </table>
    @endif

    <script>
        // Auto-open print dialog when view is opened
        window.onload = function () {
            // Give DOM/render a brief moment then print
            setTimeout(function () { window.print(); }, 200);
        };
    </script>
</body>
</html>
