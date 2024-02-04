<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\InvoiceData
 *
 * @property int $id
 * @property array $data
 * @property string $type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Database\Factories\InvoiceDataFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData query()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceData whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class InvoiceData extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'data'
    ];

    protected $casts = [
        'data' => 'json'
    ];
}
