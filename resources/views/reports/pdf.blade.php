<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pamela Inventory Report PDF</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
        h2 { margin: 0 0 6px 0; }
        .meta { font-size: 11px; margin-bottom: 8px; color: #444; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #888; padding: 6px; text-align: left; }
        th { background: #f1f1f1; font-weight: bold; }
        tfoot td { font-weight: bold; background: #fafafa; }
        .right { text-align: right; }
        .center { text-align: center; }
        .badge {
            display: inline-block; padding: 2px 6px; font-size: 10px;
            border: 1px solid #aaa; border-radius: 3px; background: #eee;
        }
    </style>
</head>
<body>

    <h2>Pamela Inventory — Report</h2>
    <div class="meta">
        <div>Tab: <span class="badge">{{ str_replace('_',' ', strtoupper($tab)) }}</span></div>
        <div>Generated: {{ $generated_at }}</div>
        <div>
            Filters:
            Date From: {{ $filters['date_from'] ?? '-' }} |
            Date To: {{ $filters['date_to'] ?? '-' }} |
            Product ID: {{ $filters['product_id'] ?? '-' }} |
            Created By: {{ $filters['created_by'] ?? '-' }}
        </div>
    </div>

    <table>
        <thead>
        @if($tab === 'inventory')
            <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th class="right">Remaining Qty</th>
                <th class="right">Price</th>
                <th class="right">Sales Price</th>
                <th class="right">Total Value (Price)</th>
                <th class="right">Total Value (Sales)</th>
            </tr>
        @else
            <tr>
                <th>Date</th>
                <th>Product</th>
                <th class="right">Qty</th>
                <th class="right">Price</th>
                <th class="right">Amount</th>
                <th>Note</th>
            </tr>
        @endif
        </thead>

        <tbody>
        @if($tab === 'inventory')
            @foreach($rows as $r)
                <tr>
                    <td>{{ $r['name'] }}</td>
                    <td>{{ $r['sku'] }}</td>
                    <td>{{ $r['barcode'] }}</td>
                    <td class="right">{{ $r['remaining_qty'] }}</td>
                    <td class="right">{{ number_format($r['price'], 2) }}</td>
                    <td class="right">{{ number_format($r['sales_price'], 2) }}</td>
                    <td class="right">{{ number_format($r['total_value'], 2) }}</td>
                    <td class="right">{{ number_format($r['total_value_sales'], 2) }}</td>
                </tr>
            @endforeach
        @else
            @foreach($rows as $r)
                @php
                    $price = $r->product->price ?? 0;
                    $amount = $r->quantity * $price;
                @endphp
                <tr>
                    <td>{{ optional($r->timestamp)->format('Y-m-d H:i') }}</td>
                    <td>{{ $r->product->name ?? '-' }}</td>
                    <td class="right">{{ $r->quantity }}</td>
                    <td class="right">{{ number_format($price, 2) }}</td>
                    <td class="right">{{ number_format($amount, 2) }}</td>
                    <td>{{ $r->note ?? '' }}</td>
                </tr>
            @endforeach
        @endif
        </tbody>

        <tfoot>
        @if($tab === 'inventory')
            <tr>
                <td colspan="3">TOTALS</td>
                <td class="right">{{ $totals['remaining_qty'] ?? 0 }}</td>
                <td></td>
                <td></td>
                <td class="right">{{ number_format($totals['inventory_value'] ?? 0, 2) }}</td>
                <td class="right">{{ number_format($totals['inventory_value_sales'] ?? 0, 2) }}</td>
            </tr>
        @else
            <tr>
                <td colspan="2">TOTALS</td>
                <td class="right">{{ $totals['qty'] ?? 0 }}</td>
                <td></td>
                <td class="right">{{ number_format($totals['amount'] ?? 0, 2) }}</td>
                <td colspan="2"></td>
            </tr>
        @endif
        </tfoot>
    </table>

</body>
</html>
