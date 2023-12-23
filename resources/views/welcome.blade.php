<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="cupcake">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet"/>

    <!-- Styles -->
    @vite(['resources/js/app.js'])
    <meta name="token" content="{{ csrf_token() }}">

</head>

<body class="antialiased bg-gray-100 dark:bg-gray-900" id="app"
      data-env="{{json_encode($env)}}"
>
</body>
</html>
