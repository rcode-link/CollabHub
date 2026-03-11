@props(['url', 'logo' => null])
@php
    if (!$logo) {
        $company = \App\Models\Company::whereIsCostumerCompany(false)->first();
        $logo = $company?->getFirstMediaUrl('avatar');
        $companyName = $company?->name ?? config('app.name');
    } else {
        $companyName = trim($slot);
    }
@endphp
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
@if ($logo)
<img src="{{ $logo }}" alt="{{ $companyName }}" style="max-height: 100px; width: auto;">
<div style="margin-top: 8px; font-size: 18px; font-weight: 600; color: #333;">{{ $companyName }}</div>
@else
<div style="font-size: 18px; font-weight: 600; color: #333;">{{ $companyName }}</div>
@endif
</a>
</td>
</tr>
