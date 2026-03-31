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
        // Add Creem columns to users and drop Cashier/Stripe columns
        Schema::table('users', function (Blueprint $table) {
            $table->string('creem_customer_id')->nullable()->unique()->after('email');
            $table->string('creem_subscription_id')->nullable()->after('creem_customer_id');
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'stripe_id')) {
                $table->dropIndex(['stripe_id']);
                $table->dropColumn('stripe_id');
            }

            foreach (['pm_type', 'pm_last_four', 'trial_ends_at'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        // Drop Cashier subscription tables
        Schema::dropIfExists('subscription_items');
        Schema::dropIfExists('subscriptions');

        // Update plans: replace Stripe columns with Creem product ID
        Schema::table('plans', function (Blueprint $table) {
            $table->string('creem_product_id')->nullable()->after('has_advanced_charts');
        });

        Schema::table('plans', function (Blueprint $table) {
            $columns = ['stripe_price_id', 'stripe_promo_price_id'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('plans', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['creem_customer_id', 'creem_subscription_id']);
            $table->string('stripe_id')->nullable()->index();
            $table->string('pm_type')->nullable();
            $table->string('pm_last_four', 4)->nullable();
            $table->timestamp('trial_ends_at')->nullable();
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('creem_product_id');
            $table->string('stripe_price_id')->nullable();
            $table->string('stripe_promo_price_id')->nullable();
        });
    }
};
