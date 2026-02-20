<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->string('entity_type')->nullable()->change();
            $table->unsignedBigInteger('entity_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->string('entity_type')->nullable(false)->change();
            $table->unsignedBigInteger('entity_id')->nullable(false)->change();
        });
    }
};
