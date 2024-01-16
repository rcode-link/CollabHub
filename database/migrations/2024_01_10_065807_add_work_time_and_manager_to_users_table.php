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
        Schema::table('users', function (Blueprint $table) {
            $table->timeTz('start_work_time')->nullable();
            $table->timeTz('end_work_time')->nullable();
            $table->foreignId('manager_id')->nullable()->constrained('id')->on('users');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('start_work_time');
            $table->dropColumn('end_work_time');
            $table->dropForeign('manager_id');
            $table->dropColumn('manager_id');
        });
    }
};
