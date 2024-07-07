<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{$model->number}}</title>
    <style>
        @font-face {
            font-family: 'Open';
            src: url({{ storage_path('fonts/OpenSans-VariableFont_wdth.ttf') }});
        }

        * {
            font-family: 'Open', sans-serif;
            font-size: 12px;
            text-align: justify;
        }

        header {
            display: flex;
        }

        h3 {
            padding: 0;
            margin: 0;
            font-size: 2rem;
        }
        .note {
line-height: 1px;
        }
        .mb-10 {
            margin-bottom: 10px;
        }

        .w-full {
            width: 100%;
        }


        .table td,
        .table th {
            padding: 0.5rem;
            text-align: center;
        }

        .table th {
            border-bottom: 1px solid #bebebe;
        }

        table.table {
            border-collapse: collapse;
        }


        header {
            position: fixed;
            top: -60px;
            left: 0px;
            right: 0px;
            height: 150px;

            text-align: center;
            line-height: 35px;
        }

        footer {
            position: fixed;
            bottom: -60px;
            left: 0px;
            right: 0px;
            height: 100px;

            /** Extra personal styles **/
            color: white;
            text-align: center;
            line-height: 35px;
        }

        main {
            /* margin-top: 50px; */
        }

        header h1,
        header p {
            margin: 0;
            padding: 0;
            text-align: center;
        }

        header p {
            margin-top: -20px;
            font-size: 10px;
        }

        header img {
            max-height: 50px;
            width: auto;
            margin-left: auto;
            margin-right: auto;
            margin-top: 20px;
            display: block;
        }

        .text-sm {
            font-size: 10px;
        }

        b {
            font-weight: bold;
        }
    </style>
</head>

<body>
    {{-- <header> --}}
    {{-- <img src="{{ $company->getFirstMedia('avatar')?->getPath() }}" /> --}}
    {{-- </header> --}}
    <main>
        <table class="w-full">
            <tr>
                <td width='50%'>
                    <h3 class="mb-10">
                        {{ $company->name }}
                    </h3>
                <div>
                        <p>
                            {{ $company->billing_address ?? $company->address }}
                            <br />
                            {{ $company->billing_city ?? $company->city }}
                            {{ $company->billing_zip ?? $company->zip }},
                            <br />
                            {{ $company->billing_country ?? $company->country }}
                        </p>
                    </div>
                </td>
                <td width='50%'>
                    <p class="mb-10" style="margin-left: auto">
                        <b>Invoice number</b> : {{ $model->number }}
                    </p>
                    <p class="mb-10" style="margin-left: auto">
                        <b>Invoice date</b> : {{ Carbon\Carbon::parse($model->date)->format('M d Y') }}
                    </p>
                    <p class="mb-10" style="margin-left: auto">
                        <b>Invoice due date</b> : {{ Carbon\Carbon::parse($model->due_date)->format('M d Y') }}
                    </p>
                </td>
            </tr>
        </table>
        <br>
        <br>
        <p >Bill to:</p>
        <h3>{{ $model->company->name }}</h3>
        <p style="width: 33.333%">
            {{ $model->company->billing_address ?? $model->company->address }}
            <br />
            {{ $model->company->billing_city ?? $model->company->city }}
            {{ $model->company->billing_zip ?? $model->company->zip }},
            <br />
            {{ $model->company->billing_country ?? $model->company->country }}
        </p>
        <br>
        <br>
        <table class="w-full table">
            <thead>
                <tr>
                    <th>Order no.</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($model->items as $index => $obj)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $obj->billingItem->title }}</td>
                        <td>
                            @if ($model->company?->currency)
                                {{ formatMoney($obj->price, $model->company->currency?->currency, $model->company->currency?->format) }}
                            @else
                                {{ formatMoney($obj->price, 'USD') }}
                            @endif
                        </td>
                        <td>{{ number_format($obj->qty / 100, 2) }}</td>
                        <td>
                            @if ($model->company?->currency)
                                {{ formatMoney($obj->total, $model->company->currency?->currency, $model->company->currency?->format) }}
                            @else
                                {{ formatMoney($obj->total, 'USD') }}
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3"></th>
                    <th>Total</th>
                    <th>
                        @if ($model->company?->currency)
                            {{ formatMoney($model->total, $model->company->currency?->currency, $model->company->currency?->format) }}
                        @else
                            {{ formatMoney($model->total, 'USD') }}
                        @endif
                    </th>
                </tr>
            </tfoot>
        </table>
        <div style="width: 50%" class="note">
            <h5>Note</h5>
            <x-markdown>
                {!! $model->note !!}
            </x-markdown>
        </div>
    </main>
</body>

</html>
