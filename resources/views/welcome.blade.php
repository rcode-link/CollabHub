<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="cupcake">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <meta name="description" content="My Awesome App description">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
    <link rel="mask-icon" href="/mask-icon.svg" color="#FFFFFF">
    <meta name="theme-color" content="#ffffff">
    @production
        @php
            $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
            echo '<script type="module" src="/build/'. $manifest['resources/js/app.js']['file'] .'"></script>';
            echo '<link rel="stylesheet" href="/build/' . $manifest['resources/js/app.js']['css'][0] . '">';
        @endphp
    @else
        @vite(['resources/js/app.js'])
    @endproduction
    <!-- Styles -->
    <meta name="token" content="{{ csrf_token() }}">

</head>

<body class="antialiased bg-gray-100 dark:bg-gray-900" id="app" data-env="{{ json_encode($env) }}">

</body>

</html>
