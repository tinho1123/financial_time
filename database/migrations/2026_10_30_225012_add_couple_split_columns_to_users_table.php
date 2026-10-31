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
            $table->string('partner_name')->nullable()->after('email');
            $table->unsignedBigInteger('own_income_in_cents')->nullable()->after('partner_name');
            $table->unsignedBigInteger('partner_income_in_cents')->nullable()->after('own_income_in_cents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['partner_name', 'own_income_in_cents', 'partner_income_in_cents']);
        });
    }
};
