<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('task_relations', function (Blueprint $table) {
            $table->enum('direction', ['parent', 'child'])->default('child')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('task_relations', function (Blueprint $table) {
            $table->dropColumn('direction');
        });
    }
};
