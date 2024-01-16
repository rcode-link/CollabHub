<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_task', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->references('id')->on('tasks');
            $table->foreignId('task_id')->constrained();
            $table->foreignId('task_relation_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_task');
    }
};
