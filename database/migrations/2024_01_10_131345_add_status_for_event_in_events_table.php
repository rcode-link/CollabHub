<?php

use App\Helpers\Enums\EventTypes;use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('approved')->default(true);
            $table->enum('type', [EventTypes::Event->value, EventTypes::Vacation->value])->default(EventTypes::Event->value);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('approved');
            $table->dropColumn('type');

        });
    }
};
