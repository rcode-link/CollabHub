<?php

use App\Helpers\Enums\PermissionsScopes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $slug = Str::slug('Can read document');

        if (! DB::table('permission_definitions')->where('slug', $slug)->exists()) {
            DB::table('permission_definitions')->insert([
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can read document',
                'slug' => $slug,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('permission_definitions')->where('slug', Str::slug('Can read document'))->delete();
    }
};
