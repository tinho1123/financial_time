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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('price_in_cents')->default(0);
            $table->unsignedBigInteger('promo_price_in_cents')->nullable();
            $table->unsignedTinyInteger('promo_months')->nullable();
            $table->enum('interval', ['free', 'monthly', 'annual']);
            $table->unsignedTinyInteger('max_accounts')->nullable();
            $table->unsignedTinyInteger('max_categories')->nullable();
            $table->boolean('has_advanced_charts')->default(false);
            $table->string('creem_product_id')->nullable();
            $table->boolean('has_creem_checkout')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
