<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->string('comment_id')->nullable()->after('parent_id');
            $table->text('quoted_text')->nullable()->after('comment_id');
            $table->index('comment_id');
        });
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropIndex(['comment_id']);
            $table->dropColumn(['comment_id', 'quoted_text']);
        });
    }
};
