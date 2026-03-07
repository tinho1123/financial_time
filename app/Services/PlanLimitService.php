<?php

namespace App\Services;

use App\Models\User;

class PlanLimitService
{
    public function canCreateAccount(User $user): bool
    {
        return $user->canAddAccount();
    }

    public function canCreateCategory(User $user): bool
    {
        return $user->canAddCategory();
    }
}
