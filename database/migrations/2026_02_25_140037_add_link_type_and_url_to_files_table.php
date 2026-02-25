<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE files MODIFY COLUMN type ENUM('file','folder','link') NOT NULL DEFAULT 'file'");

        Schema::table('files', function (Blueprint $table) {
            $table->string('url', 2048)->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn('url');
        });

        DB::statement("ALTER TABLE files MODIFY COLUMN type ENUM('file','folder') NOT NULL DEFAULT 'file'");
    }
};
