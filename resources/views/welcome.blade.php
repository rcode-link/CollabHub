<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="cupcake">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" type="image/png" sizes="144x144" href="logo.png" />
    <meta name="theme-color" content="#4f46e5">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-icon" href="logo.png">
<script src="http://localhost:8098"></script>
    {{-- @production
        @php
            $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
            echo '<script type="module" src="/build/'. $manifest['resources/js/app.js']['file'] .'"></script>';
            echo '<link rel="stylesheet" href="/build/' . $manifest['resources/js/app.js']['css'][0] . '">';
        @endphp
    @else
    @endproduction --}}
    @vite(['resources/js/app.js'])

    <script src="/web-notifications.js"></script>
    <!-- Styles -->
    <meta name="token" content="{{ csrf_token() }}">

</head>

<body class="antialiased bg-gray-100 dark:bg-gray-900" id="app" data-env="{{ json_encode($env) }}">

</body>

</html>
