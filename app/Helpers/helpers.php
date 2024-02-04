<?php
use Money\Currencies\ISOCurrencies;
use Money\Currency;
use Money\Formatter\IntlMoneyFormatter;
use Money\Money;

function formatMoney($val, $currency = null, $format = null)
{

    $money = new Money($val, new Currency($currency ?? 'USD'));
    $currencies = new ISOCurrencies();

    $numberFormatter = new \NumberFormatter($format ?? 'en_US', \NumberFormatter::CURRENCY);
    $moneyFormatter = new IntlMoneyFormatter($numberFormatter, $currencies);

    echo $moneyFormatter->format($money);
}