<?php

namespace App\Enums;

enum AccountType: string
{
    case Checking = 'checking';
    case Savings = 'savings';
    case Cash = 'cash';
    case Credit = 'credit';
    case Investment = 'investment';

    public function label(): string
    {
        return match ($this) {
            self::Checking => 'Conta Corrente',
            self::Savings => 'Poupança',
            self::Cash => 'Dinheiro',
            self::Credit => 'Cartão de Crédito',
            self::Investment => 'Investimento',
        };
    }
}
