<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('email')->nullable()->after('name');
            $table->string('invoice_locale', 5)->default('en')->after('default_vat_rate');
            $table->text('invoice_cc_emails')->nullable()->after('invoice_locale');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['email', 'invoice_locale', 'invoice_cc_emails']);
        });
    }
};
