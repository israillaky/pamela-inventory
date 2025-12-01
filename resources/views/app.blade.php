<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Pamelas Online Shop') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
       @php
            $settings = app(\App\Services\SettingsService::class)->all();
            $logo = $settings['company_logo'] ?? null;

            // Default fallback logo
            $defaultLogo = asset('assets/logo/pamelas-logo.png');

            // Use custom logo if it exists, otherwise fallback
            $favicon = $defaultLogo;
        @endphp

        <link rel="icon" type="image/png" href="{{ $favicon }}">


        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <style>
            /* Outfit */
            @font-face {
                font-family: "Outfit";
                src: url("{{ asset('fonts/outfit/Outfit-Regular.ttf') }}") format("truetype");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Outfit";
                src: url("{{ asset('fonts/outfit/Outfit-Medium.ttf') }}") format("truetype");
                font-weight: 500;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Outfit";
                src: url("{{ asset('fonts/outfit/Outfit-SemiBold.ttf') }}") format("truetype");
                font-weight: 600;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Outfit";
                src: url("{{ asset('fonts/outfit/Outfit-Bold.ttf') }}") format("truetype");
                font-weight: 700;
                font-style: normal;
                font-display: swap;
            }

            /* Montserrat (optional if you use it) */
            @font-face {
                font-family: "Montserrat";
                src: url("{{ asset('fonts/montserrat/Montserrat-Regular.ttf') }}") format("truetype");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Montserrat";
                src: url("{{ asset('fonts/montserrat/Montserrat-Medium.ttf') }}") format("truetype");
                font-weight: 500;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Montserrat";
                src: url("{{ asset('fonts/montserrat/Montserrat-SemiBold.ttf') }}") format("truetype");
                font-weight: 600;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: "Montserrat";
                src: url("{{ asset('fonts/montserrat/Montserrat-Bold.ttf') }}") format("truetype");
                font-weight: 700;
                font-style: normal;
                font-display: swap;
            }
        </style>

    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
