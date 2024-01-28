<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\InvoiceItem
 *
 * @property int $id
 * @property int $price
 * @property int $qty
 * @property int $total
 * @property int $billing_item_id
 * @property int $invoice_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Database\Factories\InvoiceItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem query()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereBillingItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class InvoiceItem extends Model
{
    use HasFactory;
}
