<?php

use App\Enums\PlanInterval;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $freePlanId = Plan::query()->where('interval', PlanInterval::Free)->value('id');

        if ($freePlanId) {
            User::query()->whereNull('plan_id')->update(['plan_id' => $freePlanId]);
        }
    }

    public function down(): void
    {
        //
    }
};
