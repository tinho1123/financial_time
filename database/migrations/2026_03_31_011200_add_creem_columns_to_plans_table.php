<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The 2026_03_07_202805_create_plans_table migration was edited in place after it
     * had already run in production (renaming stripe_price_id/stripe_promo_price_id to
     * creem_product_id/has_creem_checkout), so environments where it already ran never
     * picked up the new columns. This migration brings those environments up to date;
     * it is a no-op anywhere the columns already exist (fresh installs, CI, local dev).
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            if (! Schema::hasColumn('plans', 'creem_product_id')) {
                $table->string('creem_product_id')->nullable();
            }

            if (! Schema::hasColumn('plans', 'has_creem_checkout')) {
                $table->boolean('has_creem_checkout')->default(false);
            }
        });

        Schema::table('plans', function (Blueprint $table) {
            if (Schema::hasColumn('plans', 'stripe_price_id')) {
                $table->dropColumn('stripe_price_id');
            }

            if (Schema::hasColumn('plans', 'stripe_promo_price_id')) {
                $table->dropColumn('stripe_promo_price_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->string('stripe_price_id')->nullable();
            $table->string('stripe_promo_price_id')->nullable();
            $table->dropColumn(['creem_product_id', 'has_creem_checkout']);
        });
    }
};
