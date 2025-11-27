<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action', 50);   // created, updated, deleted, login, stock_in, stock_out, etc.
            $table->string('module', 50);   // products, stock_in, stock_out, categories, brands, users, reports
            $table->text('description')->nullable(); // string or JSON-encoded
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps(); // created_at used as log timestamp
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
