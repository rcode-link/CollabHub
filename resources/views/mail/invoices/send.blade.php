<x-mail::message>
# Invoice {{ $invoiceNumber }}

@if($messageBody)
{{ $messageBody }}
@else
Please find the invoice attached to this email.
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
