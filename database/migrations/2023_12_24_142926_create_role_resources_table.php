<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('role_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id');
            $table->morphs('resourcable');
            $table->index(['role_id', 'resourcable_type', 'resourcable_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_resources');
    }
};
