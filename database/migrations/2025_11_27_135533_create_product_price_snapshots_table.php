<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_price_snapshots', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('stock_in_id')
                ->nullable()
                ->constrained('stock_ins')
                ->nullOnDelete();

            $table->foreignId('stock_out_id')
                ->nullable()
                ->constrained('stock_outs')
                ->nullOnDelete();

            $table->integer('quantity');

            $table->decimal('unit_price', 15, 2)->nullable();
            $table->decimal('unit_sales_price', 15, 2)->nullable();

            $table->timestamps();

            $table->index(['product_id', 'stock_in_id']);
            $table->index(['product_id', 'stock_out_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_price_snapshots');
    }
};
