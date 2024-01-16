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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('summary');
            $table->dateTimeTz('start_time');
            $table->dateTimeTz('end_time');
            $table->longText('description')->nullable();
            $table->foreignId('user_id')->constrained();
            $table->string('freq')->nullable();
            $table->string('freq_settings')->nullable();
            $table->string('freq_until')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
