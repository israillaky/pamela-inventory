<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Traits\LogActivityTrait;

class SettingsController extends Controller
{
    use LogActivityTrait;

    protected SettingsService $settings;

    public function __construct(SettingsService $settings)
    {
        $this->settings = $settings;
    }

    public function index()
    {
        $settings = $this->settings->all();

        return Inertia::render('Settings/Index', [
            'settings' => [
                'company_name'    => $settings['company_name'] ?? 'pamela-inventory',
                'company_logo'    => $settings['company_logo'] ?? null,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $current = $this->settings->all();

        $validated = $request->validate([
            'company_name'    => ['required', 'string', 'max:255'],
            'company_logo'    => ['nullable', 'image', 'max:2048'],
        ]);

        // Save scalar settings
        foreach ($validated as $key => $value) {
            if ($key !== 'company_logo') {
                $this->settings->set($key, $value);
            }
        }

        // Handle logo upload
        if ($request->hasFile('company_logo')) {
            $path = $request->file('company_logo')->store('logos', 'public');
            $logoUrl = asset('storage/' . $path);

            $this->settings->set('company_logo', $logoUrl);
        }

        // Audit log
        $this->logActivity(
            action: 'updated',
            module: 'settings',
            description: [
                'before' => [
                    'company_name' => $current['company_name'] ?? null,
                    'company_logo' => $current['company_logo'] ?? null,
                ],
                'after' => [
                    'company_name' => $validated['company_name'],
                    'company_logo' => $logoUrl,
                ],
            ]
        );

        return redirect()
            ->route('settings.index')
            ->with('success', 'Settings updated successfully.');
    }
}
