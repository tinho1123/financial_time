<?php

namespace App\Enums;

enum PlanInterval: string
{
    case Free = 'free';
    case Monthly = 'monthly';
    case Annual = 'annual';
}
