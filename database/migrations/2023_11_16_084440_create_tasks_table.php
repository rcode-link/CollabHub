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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->longText('description')->nullable();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('created_by');
            $table->foreignId('project_id')->constrained();
            $table->foreignId('type_id')->references('id')->on('task_types');
            $table->foreignId('status_id');
            $table->foreignId('task_status_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
