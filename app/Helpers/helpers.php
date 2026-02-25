<?php

use Money\Currencies\ISOCurrencies;
use Money\Currency;
use Money\Formatter\IntlMoneyFormatter;
use Money\Money;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Return a URL for a Spatie Media item.
 * Uses a temporary presigned URL for S3-based disks,
 * falls back to getUrl() for local disks.
 */
function mediaUrl(?Media $media, string $fallback = ''): string
{
    if (! $media) {
        return $fallback ?: config('app.url').'/storage/images/avatar.png';
    }

    try {
        return $media->getTemporaryUrl(now()->addMinutes(60));
    } catch (\Exception) {
        return $media->getUrl();
    }
}

function formatMoney($val, $currency = null, $format = null)
{

    $money = new Money($val, new Currency($currency ?? 'USD'));
    $currencies = new ISOCurrencies;

    $numberFormatter = new NumberFormatter($format ?? 'en_US', NumberFormatter::CURRENCY);
    $moneyFormatter = new IntlMoneyFormatter($numberFormatter, $currencies);

    echo $moneyFormatter->format($money);
}
