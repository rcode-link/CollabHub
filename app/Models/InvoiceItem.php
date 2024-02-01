<?php

namespace App\Models;

use App\Events\InvoiceItemsUpdate;
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
 * @property int|null $unit
 * @property-read \App\Models\BillingItem $billingItem
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceItem whereUnit($value)
 * @mixin \Eloquent
 */
class InvoiceItem extends Model
{
    use HasFactory;


    protected $fillable = [
        'price',
        'qty',
        'total',
        'billing_item_id',
    ];


    static function invoiceItemAddedOrUpdated(InvoiceItem $invoiceItem)
    {
        $invoiceSum = Invoice::whereId($invoiceItem->invoice_id)->withSum('items', 'total')->firstOrFail();
        $invoiceSum->update([
            'total' => $invoiceSum->items_sum_total ?? 0
        ]);
        InvoiceItemsUpdate::dispatch($invoiceItem->invoice_id);
    }

    protected static function booted()
    {
        parent::booted();

        self::created(fn(InvoiceItem $invoiceItem) => InvoiceItem::invoiceItemAddedOrUpdated($invoiceItem));

        self::updated(fn(InvoiceItem $invoiceItem) => InvoiceItem::invoiceItemAddedOrUpdated($invoiceItem));

        self::deleted(fn(InvoiceItem $invoiceItem) => InvoiceItem::invoiceItemAddedOrUpdated($invoiceItem));
    }

    public function billingItem()
    {
        return $this->belongsTo(BillingItem::class);
    }

    public function invoice()
    {
        $this->belongsTo(Invoice::class);
    }
}
