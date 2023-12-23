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
        // relation is for permission_definitions table, but name of identifier is big
        Schema::create('permission_role',function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained();
            $table->foreignId('role_id')->constrained();
            $table->index(['permission_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_definition_role');
        //
    }
};
