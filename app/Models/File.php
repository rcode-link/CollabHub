<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Kalnoy\Nestedset\Collection;
use Kalnoy\Nestedset\NodeTrait;
use Kalnoy\Nestedset\QueryBuilder;

/**
 * App\Models\File
 *
 * @property int $id
 * @property string $title
 * @property string $type
 * @property string|null $extension
 * @property string|null $content
 * @property int $_lft
 * @property int $_rgt
 * @property int|null $parent_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, File> $children
 * @property-read int|null $children_count
 * @property-read File|null $parent
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static QueryBuilder|File ancestorsAndSelf($id, array $columns = [])
 * @method static QueryBuilder|File ancestorsOf($id, array $columns = [])
 * @method static QueryBuilder|File applyNestedSetScope(?string $table = null)
 * @method static QueryBuilder|File countErrors()
 * @method static QueryBuilder|File d()
 * @method static QueryBuilder|File defaultOrder(string $dir = 'asc')
 * @method static QueryBuilder|File descendantsAndSelf($id, array $columns = [])
 * @method static QueryBuilder|File descendantsOf($id, array $columns = [], $andSelf = false)
 * @method static QueryBuilder|File fixSubtree($root)
 * @method static QueryBuilder|File fixTree($root = null)
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static QueryBuilder|File getNodeData($id, $required = false)
 * @method static QueryBuilder|File getPlainNodeData($id, $required = false)
 * @method static QueryBuilder|File getTotalErrors()
 * @method static QueryBuilder|File hasChildren()
 * @method static QueryBuilder|File hasParent()
 * @method static QueryBuilder|File isBroken()
 * @method static QueryBuilder|File leaves(array $columns = [])
 * @method static QueryBuilder|File makeGap(int $cut, int $height)
 * @method static QueryBuilder|File moveNode($key, $position)
 * @method static QueryBuilder|File newModelQuery()
 * @method static QueryBuilder|File newQuery()
 * @method static QueryBuilder|File orWhereAncestorOf(bool $id, bool $andSelf = false)
 * @method static QueryBuilder|File orWhereDescendantOf($id)
 * @method static QueryBuilder|File orWhereNodeBetween($values)
 * @method static QueryBuilder|File orWhereNotDescendantOf($id)
 * @method static QueryBuilder|File query()
 * @method static QueryBuilder|File rebuildSubtree($root, array $data, $delete = false)
 * @method static QueryBuilder|File rebuildTree(array $data, $delete = false, $root = null)
 * @method static QueryBuilder|File reversed()
 * @method static QueryBuilder|File root(array $columns = [])
 * @method static QueryBuilder|File whereAncestorOf($id, $andSelf = false, $boolean = 'and')
 * @method static QueryBuilder|File whereAncestorOrSelf($id)
 * @method static QueryBuilder|File whereContent($value)
 * @method static QueryBuilder|File whereCreatedAt($value)
 * @method static QueryBuilder|File whereDescendantOf($id, $boolean = 'and', $not = false, $andSelf = false)
 * @method static QueryBuilder|File whereDescendantOrSelf(string $id, string $boolean = 'and', string $not = false)
 * @method static QueryBuilder|File whereExtension($value)
 * @method static QueryBuilder|File whereId($value)
 * @method static QueryBuilder|File whereIsAfter($id, $boolean = 'and')
 * @method static QueryBuilder|File whereIsBefore($id, $boolean = 'and')
 * @method static QueryBuilder|File whereIsLeaf()
 * @method static QueryBuilder|File whereIsRoot()
 * @method static QueryBuilder|File whereLft($value)
 * @method static QueryBuilder|File whereNodeBetween($values, $boolean = 'and', $not = false)
 * @method static QueryBuilder|File whereNotDescendantOf($id)
 * @method static QueryBuilder|File whereParentId($value)
 * @method static QueryBuilder|File whereRgt($value)
 * @method static QueryBuilder|File whereTitle($value)
 * @method static QueryBuilder|File whereType($value)
 * @method static QueryBuilder|File whereUpdatedAt($value)
 * @method static QueryBuilder|File withDepth(string $as = 'depth')
 * @method static QueryBuilder|File withoutRoot()
 * @property string $entity_type
 * @property int $entity_id
 * @method static QueryBuilder|File whereEntityId($value)
 * @method static QueryBuilder|File whereEntityType($value)
 * @method static \Database\Factories\FileFactory factory($count = null, $state = [])
 * @property string|null $file_id
 * @method static QueryBuilder|File whereFileId($value)
 * @property-read Model|\Eloquent $entity
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @method static Collection<int, static> all($columns = ['*'])
 * @method static Collection<int, static> get($columns = ['*'])
 * @mixin Eloquent
 */
class File extends Model
{
    use HasFactory;
    use NodeTrait;

    protected $guarded = [];

    public function entity(){
        return $this->morphTo();
    }

    protected $casts = [
        'content' => 'array'
    ];
}
