<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Reports — {{ ucfirst(str_replace('_', ' ', $tab)) }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 12px;
            color: #111827;
        }
        h1, h2, h3 {
            margin: 0 0 4px 0;
        }
        .small {
            font-size: 11px;
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
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 4px 6px;
        }
        th {
            background-color: #f9fafb;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
        }
        td {
            font-size: 11px;
        }
        .text-left text-md { text-align: right; }
        .text-left text-md { text-align: left; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 600; }
        .border-top {
            border-top: 2px solid #d1d5db;
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

    <h1>Pamela's Online Shop</h1>
    <h2>Report — {{ ucfirst(str_replace('_', ' ', $tab)) }}</h2>

    {{-- Filters summary --}}
    <div class="mb-3 small">
        @if (!empty($filters['date_from']) || !empty($filters['date_to']))
            <div class="mb-1">
                <span class="font-bold" style="font-size:14px;">Date Range:</span>
                <span style="font-size:14px;">{{ $filters['date_from'] ?? '—' }} to {{ $filters['date_to'] ?? '—' }}</span>
            </div>
        @endif

        @if (!empty($filters['product_id']))
            <div class="mb-1">
                <span class="font-bold" style="font-size:14px;">Product ID:</span> {{ $filters['product_id'] }}
            </div>
        @endif

    </div>

    {{-- MAIN TABLE --}}
    @if ($tab === 'inventory')
        <table>
            <thead>
                <tr>
                    <th class="text-left text-md" style="font-size:14px;">Product</th>
                    <th class="text-left text-md" style="font-size:14px;">Remaining Qty</th>
                    <th class="text-left text-md" style="font-size:14px;">Price</th>
                    <th class="text-left text-md" style="font-size:14px;">Sales Price</th>
                    <th class="text-left text-md" style="font-size:14px;">Total @ Price</th>
                    <th class="text-left text-md" style="font-size:14px;">Total @ Sales Price</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    <tr>
                        <td class="text-left text-md" style="font-size:14px;">{{ $row['name'] ?? '' }}</td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">{{ $row['remaining_qty'] ?? 0 }}</td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">{{ $money($row['unit_price'] ?? $row['price'] ?? 0) }}</td>
                        <td class="text-right text-md" style="font-size:14px;text-align:right;">
                            @if (!empty($row['unit_sales_price']))
                                {{ $money($row['unit_sales_price']) }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-right text-md" style="font-size:14px;text-align:right;">{{ $money($row['total_value'] ?? 0) }}</td>
                        <td class="text-right text-md" style="font-size:14px;text-align:right;">{{ $money($row['total_value_sales'] ?? 0) }}</td>
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
                        <td   class="text-left text-md font-bold" style="font-size:14px;">Totals:</td>
                        <td class="text-right text-md font-bold" style="font-size:14px;text-align:right;">{{ $totals['remaining_qty'] ?? 0 }}</td>
                        <td class="text-right text-md font-bold" style="font-size:14px;text-align:right;">{{ $money($footer['total_price'] ?? 0) }}</td>
                        <td class="text-right text-md font-bold" style="font-size:14px;text-align:right;">{{ $money($footer['total_sales_price'] ?? 0) }}</td>
                        <td class="text-right text-md font-bold" style="font-size:14px;text-align:right;">{{ $money($totals['inventory_value'] ?? 0) }}</td>
                        <td class="text-right text-md font-bold" style="font-size:14px;text-align:right;">{{ $money($totals['inventory_value_sales'] ?? 0) }}</td>
                    </tr>
                </tfoot>
            @endif
        </table>

    @elseif ($tab === 'sales_in')
        <table>
            <thead>
                <tr>
                    <th class="text-left text-md" style="font-size:14px;">Product</th>
                    <th class="text-left text-md" style="font-size:14px;">SKU</th>
                    <th class="text-left text-md" style="font-size:14px;">Price</th>
                    <th class="text-left text-md" style="font-size:14px;">Sales Price</th>
                    <th class="text-left text-md" style="font-size:14px;">Total Amount</th>
                    <th class="text-left text-md" style="font-size:14px;">Total Sale Amount</th>
                    <th class="text-left text-md" style="font-size:14px;">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    @php $p = $row['product'] ?? []; @endphp
                    <tr>
                        <td class="text-left text-md" style="font-size:14px;">{{ $p['name'] ?? '' }}</td>
                        <td class="text-left text-md" style="font-size:14px; text-align:right;">{{ $row['quantity'] ?? 0 }}</td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">{{ $money($row['unit_price'] ?? 0) }}</td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">
                            @if (!empty($row['unit_sales_price']))
                                {{ $money($row['unit_sales_price']) }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">{{ $money($row['amount'] ?? 0) }}</td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">{{ $money($row['sale_amount'] ?? 0) }}</td>
                        <td class="text-left text-md" style="font-size:14px;">{{ date('M d, Y', strtotime($row['timestamp'] ?? '')) ?? '' }}</td>


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
                        <td   class="text-left text-md font-bold" style="font-size:14px;">Totals:</td>
                        <td class="text-left text-md font-bold" style="font-size:14px; text-align:right;">{{ $totals['qty'] ?? 0 }}</td>
                        <td class="text-left text-md" style="font-size:14px;"></td>
                        <td class="text-left text-md" style="font-size:14px;"></td>
                        <td class="text-left text-md font-bold" style="font-size:14px;text-align:right;">{{ $money($totals['amount'] ?? 0) }}</td>
                        <td class="text-left text-md font-bold" style="font-size:14px;text-align:right;">{{ $money($totals['sale_amount'] ?? 0) }}</td>
                        <td colspan="1"></td>
                    </tr>
                </tfoot>
            @endif
        </table>

    @elseif ($tab === 'sales_out')
        <table>
            <thead>
                <tr>
                    <th class="text-left text-md" style="font-size:14px;">Product</th>
                    <th class="text-left text-md" style="font-size:14px;">Qty</th>
                    <th class="text-left text-md" style="font-size:14px;">Price</th>
                    <th class="text-left text-md" style="font-size:14px;">Sales Price</th>
                    <th class="text-left text-md" style="font-size:14px;">Amount</th>
                    <th class="text-left text-md" style="font-size:14px;">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    @php $p = $row['product'] ?? []; @endphp
                    <tr>
                        <td class="text-left text-md" style="font-size:14px;">{{ $p['name'] ?? '' }}</td>
                        <td class="text-left text-md" style="font-size:14px; text-align:right;">{{ $row['quantity'] ?? 0 }}</td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">{{ $money($row['unit_price'] ?? 0) }}</td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">
                            @if (!empty($row['unit_sales_price']))
                                {{ $money($row['unit_sales_price']) }}
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-left text-md" style="font-size:14px;text-align:right;">{{ $money($row['amount'] ?? 0) }}</td>
                        <!-- format date -->
                        <td class="text-left text-md" style="font-size:14px;">{{ date('M d, Y', strtotime($row['timestamp'] ?? '')) ?? '' }}</td>


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
                        <td   class="text-left text-md font-bold" style="font-size:14px;">Total:</td>
                        <td class="text-left text-md font-bold" style="font-size:14px; text-align:right;">{{ $totals['qty'] ?? 0 }}</td>
                        <td colspan="2" class="text-left text-md" style="font-size:14px;"></td>
                        <td class="text-left text-md font-bold" style="font-size:14px; text-align:right;">{{ $money($totals['amount'] ?? 0) }}</td>
                        <td colspan="1"></td>
                    </tr>
                </tfoot>
            @endif
        </table>

    @else
        {{-- STOCK IN / STOCK OUT (no price columns) --}}
        <table>
            <thead>
                <tr>
                    <th class="text-left text-md" style="font-size:14px;">Product</th>
                    <th class="text-left text-md" style="font-size:14px;">Qty</th>
                    <th class="text-left text-md" style="font-size:14px;">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    @php $p = $row['product'] ?? []; @endphp
                    <tr>
                        <td class="text-left text-md" style="font-size:14px;">{{ $p['name'] ?? '' }}</td>
                        <td class="text-left text-md" style="font-size:14px; text-align:right;">{{ $row['quantity'] ?? 0 }}</td>
                        <td class="text-left text-md" style="font-size:14px;">{{ date('M d, Y', strtotime($row['timestamp'] ?? '')) ?? '' }}</td>


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
                        <td class="text-left text-md font-bold" style="font-size:14px;">Total Qty:</td>
                        <td class="text-right text-md font-bold" style="font-size:14px; text-align:right;">{{ $totals['qty'] ?? 0 }}</td>
                        <td colspan="1"></td>
                    </tr>
                </tfoot>
            @endif
        </table>
    @endif

</body>
</html>
