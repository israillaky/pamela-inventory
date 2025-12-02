<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Desktop\DesktopUpdateController;

Route::get('/desktop/update', [DesktopUpdateController::class, 'show'])
    ->name('desktop.update');
