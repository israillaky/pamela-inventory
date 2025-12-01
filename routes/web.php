<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    BrandController,
    CategoryController,
    ChildCategoryController,
    ProductController,
    StockInController,
    StockOutController,
    ReportsController,
    ProfileController,
    DashboardController,
    UserController,
    AuditLogController,
    SettingsController,
};

//use App\Http\Controllers\Desktop\ServerSetupController;

// Redirect homepage → login
Route::get('/', fn () => redirect()->route('login'));

require __DIR__.'/auth.php';

// AUTH + VERIFIED

/*
    // Only relevant in desktop mode; safe to leave here for web
Route::get('/native/server-setup', [ServerSetupController::class, 'show'])
->name('native.server-setup.show');

Route::post('/native/server-setup', [ServerSetupController::class, 'store'])
    ->name('native.server-setup.store');
*/

Route::middleware(['auth', 'verified'])->group(function () {

    /* -----------------------------------------------------
        DASHBOARD — all roles
    ----------------------------------------------------- */
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('role:admin,staff,warehouse_manager,cashier,warehouse_staff')
        ->name('dashboard');


    /* -----------------------------------------------------
        USERS MODULE — ADMIN ONLY
    ----------------------------------------------------- */
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('users', UserController::class)
            ->only(['index','store','update','destroy']);

        Route::middleware(['auth'])->group(function () {
            Route::get('/audit-logs', [AuditLogController::class, 'index'])
                ->name('audit-logs.index');

            Route::get('/audit-logs/export', [AuditLogController::class, 'export'])
                ->name('audit-logs.export');
        });

        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
    });



    /* -----------------------------------------------------
        ADMIN + STAFF + WAREHOUSE MANAGER — FULL CRUD MODULES
        Brands, Categories, Child Categories, Products, Reports
    ----------------------------------------------------- */
    Route::middleware(['role:admin,staff'])->group(function () {
        // Brands CRUD
        Route::resource('brands', BrandController::class)
            ->only(['index','store','update','destroy']);

        // Categories CRUD + view
        Route::get('/categories', [CategoryController::class, 'index'])
            ->name('categories.index');

        Route::post('/categories', [CategoryController::class, 'store'])
            ->name('categories.store');

        Route::put('/categories/{category}', [CategoryController::class, 'update'])
            ->name('categories.update');

        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
            ->name('categories.destroy');

        // Lazy-load children
        Route::get('/categories/{category}/children', [CategoryController::class, 'children'])
            ->name('categories.children');

        // Child Categories CRUD
        Route::post('/child-categories', [ChildCategoryController::class, 'store'])
            ->name('child-categories.store');

        Route::put('/child-categories/{childCategory}', [ChildCategoryController::class, 'update'])
            ->name('child-categories.update');

        Route::delete('/child-categories/{childCategory}', [ChildCategoryController::class, 'destroy'])
            ->name('child-categories.destroy');
    });

     Route::middleware(['role:admin,staff,warehouse_manager'])->group(function () {
        // Products CRUD + view
        Route::resource('products', ProductController::class)
            ->only(['index','store','update','destroy']);
    });


    Route::middleware(['role:admin,staff'])->group(function () {
        // Reports (view + export + print)
        Route::get('/reports', [ReportsController::class, 'index'])
            ->name('reports.index');

        Route::get('/reports/export/csv', [ReportsController::class, 'exportCsv'])
            ->name('reports.export.csv');

        Route::get('/reports/export/pdf', [ReportsController::class, 'exportPdf'])
            ->name('reports.export.pdf');

        Route::get('/reports/print', [ReportsController::class, 'print'])
            ->name('reports.print');

    });



    /* -----------------------------------------------------
        ADMIN + STAFF + WAREHOUSE MANAGER — STOCK IN/OUT CRUD
    ----------------------------------------------------- */
    Route::middleware(['role:admin,staff,warehouse_manager'])->group(function () {

        // Stock In CRUD
        Route::resource('stock-in', StockInController::class)
            ->only(['index','store','update','destroy']);

        Route::get('/stock-in/products/search', [StockInController::class, 'searchProducts'])
            ->name('stock-in.products.search');

    });

    /* -----------------------------------------------------
        ADMIN + STAFF + WAREHOUSE MANAGER — STOCK IN/OUT CRUD
    ----------------------------------------------------- */
    Route::middleware(['role:admin,staff,warehouse_manager', 'warehouse_staff' ])->group(function () {


        // Stock Out CRUD (full for these roles)
        Route::resource('stock-out', StockOutController::class)
            ->only(['index','store','update','destroy'])
            ->names('stock-out');

        Route::get('/stock-out/products/search', [StockOutController::class, 'searchProducts'])
            ->name('stock-out.products.search');
    });

    /* -----------------------------------------------------
        CASHIER — STOCK OUT ONLY (index + store + search)
        IMPORTANT: no duplicate resource routes
    ----------------------------------------------------- */
    Route::middleware(['role:admin,staff,warehouse_manager,warehouse_staff,cashier'])->group(function () {

        Route::get('/stock-out', [StockOutController::class, 'index'])
            ->name('stock-out.index');

               Route::resource('stock-out', StockOutController::class)
            ->only(['index','store','update'])
            ->names('stock-out');

        Route::get('/stock-out/products/search', [StockOutController::class, 'searchProducts'])
            ->name('stock-out.products.search');
    });


    /* -----------------------------------------------------
        PROFILE — all roles (self only)
    ----------------------------------------------------- */
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->middleware('role:admin,staff,warehouse_manager,cashier')
        ->name('profile.edit');

    Route::put('/profile', [ProfileController::class, 'update'])
        ->middleware('role:admin,staff,warehouse_manager,cashier')
        ->name('profile.update');
});
