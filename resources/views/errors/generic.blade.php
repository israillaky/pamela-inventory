<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            padding: 24px;
            background: #020617;
            color: #e5e7eb;
        }
        .card {
            max-width: 640px;
            margin: 40px auto;
            background: #020617;
            border-radius: 12px;
            padding: 20px 24px;
            border: 1px solid #1e293b;
        }
        h1 {
            font-size: 20px;
            margin-bottom: 8px;
        }
        p {
            margin: 0;
            font-size: 14px;
        }
        pre {
            margin-top: 12px;
            padding: 12px;
            background: #020617;
            border-radius: 8px;
            overflow-x: auto;
            border: 1px solid #1e293b;
            font-size: 12px;
        }
    </style>
</head>
<body>
<div class="card">
    <h1>Error</h1>
    <p>{{ $message ?? 'Something went wrong.' }}</p>

    @if(config('app.debug') && isset($exception))
        <pre>{{ $exception->getMessage() }}</pre>
    @endif
</div>
</body>
</html>
