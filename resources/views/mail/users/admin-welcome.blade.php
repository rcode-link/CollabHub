<x-mail::message>
# Introduction

The body of your message.

<x-mail::button :url="$registrationLink">
Button Text
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
