<?php

namespace App\Http\Controllers;

use App\Services\CurrencyService;
use Illuminate\Http\JsonResponse;

class CurrencyController extends Controller
{
    public function rates(CurrencyService $service): JsonResponse
    {
        return response()->json([
            'base' => 'USD',
            'rates' => $service->getRates(),
        ]);
    }
}
