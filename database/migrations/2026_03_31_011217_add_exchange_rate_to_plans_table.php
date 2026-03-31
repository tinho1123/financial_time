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
        Schema::table('plans', function (Blueprint $table) {
            $table->decimal('exchange_rate', 8, 4)->nullable()->after('creem_product_id')
                ->comment('Taxa de câmbio BRL por 1 USD usada para exibir o preço em dólar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('exchange_rate');
        });
    }
};
