<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->account = Account::factory()->create(['user_id' => $this->user->id]);
    $this->category = Category::factory()->expense()->create(['user_id' => $this->user->id, 'name' => 'Mercado']);
});

test('guests are redirected to login when exporting', function () {
    $this->get(route('transactions.export'))->assertRedirect(route('login'));
});

test('export returns a csv download with the expected headers', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('transactions.export'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    $response->assertHeader('content-disposition');
    expect($response->headers->get('content-disposition'))->toContain('.csv');
});

test('export contains only the authenticated user transactions, formatted for the pt-BR locale', function () {
    $this->actingAs($this->user);

    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'description' => 'Compra no mercado',
        'amount_in_cents' => 12345,
        'current_balance_in_cents' => 987650,
        'date' => '2026-04-05',
        'notes' => null,
    ]);

    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);
    Transaction::factory()->create([
        'user_id' => $other->id,
        'account_id' => $otherAccount->id,
        'description' => 'Não deveria aparecer',
    ]);

    $content = $this->get(route('transactions.export'))->streamedContent();

    expect($content)->toContain("\xEF\xBB\xBF");
    expect($content)->toContain('Data;Tipo;Categoria;Conta;Descrição;Valor;');
    expect($content)->toContain('05/04/2026;Despesa;Mercado;');
    expect($content)->toContain('"Compra no mercado";123,45;9876,50');
    expect($content)->not->toContain('Não deveria aparecer');
});

test('export respects the same filters as the transactions index', function () {
    $this->actingAs($this->user);

    $otherCategory = Category::factory()->expense()->create(['user_id' => $this->user->id, 'name' => 'Lazer']);

    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'description' => 'Deve aparecer',
        'date' => '2026-04-10',
    ]);

    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $otherCategory->id,
        'description' => 'Categoria errada',
        'date' => '2026-04-10',
    ]);

    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'description' => 'Fora do periodo',
        'date' => '2026-01-01',
    ]);

    $content = $this->get(route('transactions.export', [
        'category_id' => $this->category->id,
        'from' => '2026-04-01',
        'to' => '2026-04-30',
    ]))->streamedContent();

    expect($content)->toContain('Deve aparecer');
    expect($content)->not->toContain('Categoria errada');
    expect($content)->not->toContain('Fora do periodo');
});
