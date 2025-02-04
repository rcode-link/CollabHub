<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
@vite(['resources/js/app.js'])
<style>
        @font-face {
            font-family: 'Open';
            src: url({{ storage_path('fonts/OpenSans-VariableFont_wdth.ttf') }});
        }

        * {
            font-family: 'Open', sans-serif;
            font-size: 12px;
        }
img {
max-width: 150mm;
}

h1 {
    font-size: 2.25rem; /* equivalent to text-4xl in Tailwind */
    line-height: 2.5rem; /* line-height is 1.1 times font-size by default in Tailwind */
}

h2 {
    font-size: 1.875rem; /* equivalent to text-3xl in Tailwind */
    line-height: 2.25rem; /* line-height is 1.2 times font-size by default in Tailwind */
}

h3 {
    font-size: 1.5rem; /* equivalent to text-2xl in Tailwind */
    line-height: 2rem; /* line-height is 1.333 times font-size by default in Tailwind */
}

h4 {
    font-size: 1.25rem; /* equivalent to text-xl in Tailwind */
    line-height: 1.75rem; /* line-height is 1.4 times font-size by default in Tailwind */
}

h5 {
    font-size: 1.125rem; /* equivalent to text-lg in Tailwind */
    line-height: 1.75rem; /* line-height is 1.555 times font-size by default in Tailwind */
}
/* ul, ol {
    line-height: 1.5px; /* equivalent to leading-normal in Tailwind CSS
} */

ol {
    padding-left: 1.5rem; /* equivalent to pl-6 in Tailwind */
}

ul {
    padding-left: 1.5rem; /* equivalent to pl-6 in Tailwind */
}

ul > li {
    list-style-type: disc; /* equivalent to list-disc in Tailwind */
}

table th {
    border-right: 1px solid rgba(12, 12, 13, 0.1);
    border-bottom: 1px solid rgba(12, 12, 13, 0.1);
    border-top: 1px solid rgba(12, 12, 13, 0.1);
}

table td {
    border-right: 1px solid rgba(12, 12, 13, 0.1);
    border-bottom: 1px solid rgba(12, 12, 13, 0.1);
}

table td:first-child,
table th:first-child {
    border-left: 1px solid rgba(12, 12, 13, 0.1);
}
table td, table th {
    max-width: 150px !important;
    width: fill-content !important !important;
}
table {
width: 100% !important;
}

</style>
</head>
<body>
{!! str_replace('width','' , $content) !!}
</body>
</html>
