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
        Schema::table('chat_user', function (Blueprint $table) {
            // DATETIME (not TIMESTAMP) so the "muted forever" sentinel can
            // exceed the 2038 TIMESTAMP limit. NULL or past date = not muted.
            $table->dateTime('muted_until')->nullable()->after('chat_id');
            $table->index(['chat_id', 'muted_until']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_user', function (Blueprint $table) {
            $table->dropIndex(['chat_id', 'muted_until']);
            $table->dropColumn('muted_until');
        });
    }
};
