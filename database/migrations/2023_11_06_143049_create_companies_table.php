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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string("address")->nullable();
            $table->string("city")->nullable();
            $table->string("zip")->nullable();
            $table->string("country")->nullable();
            $table->string("billing_address")->nullable();
            $table->string("billing_city")->nullable();
            $table->string("billing_zip")->nullable();
            $table->string("billing_country")->nullable();
            $table->boolean('is_costumer_company')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
