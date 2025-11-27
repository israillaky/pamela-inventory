<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    protected string $cacheKey = 'settings.all';

    public function all(): array
    {
        return Cache::remember($this->cacheKey, 3600, function () {
            return Setting::pluck('value', 'key')->toArray();
        });
    }

    public function get(string $key, $default = null)
    {
        $settings = $this->all();
        return $settings[$key] ?? $default;
    }

    public function set(string $key, $value, ?int $userId = null)
    {
        $setting = Setting::firstOrNew(['key' => $key]);

        if (!$setting->exists) {
            $setting->created_by = $userId ?? Auth::id();
        }

        $setting->value = $value;
        $setting->save();

        Cache::forget($this->cacheKey);

        return $setting;
    }

    public function clearCache(): void
    {
        Cache::forget($this->cacheKey);
    }
}
