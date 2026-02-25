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
        Schema::create('video_call_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_call_id')->constrained('video_calls')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_call_requests');
    }
};
