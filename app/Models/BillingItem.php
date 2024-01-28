<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\BillingItem
 *
 * @property int $id
 * @property string $title
 * @property int $price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Database\Factories\BillingItemFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem query()
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BillingItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class BillingItem extends Model
{
    use HasFactory;
}
