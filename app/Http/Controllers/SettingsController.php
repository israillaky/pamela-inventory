<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\LogActivityTrait;
use Throwable;

class SettingsController extends Controller
{
    use LogActivityTrait;

    protected SettingsService $settings;

    public function __construct(SettingsService $settings)
    {
        $this->settings = $settings;
    }

    public function index(Request $request)
    {
        try {
            // Only admin can view settings
            abort_unless(Auth::user()?->role === 'admin', 403);

            $settings = $this->settings->all();

            $rawLogo = $settings['company_logo'] ?? null;
            $logoUrl = null;

            if ($rawLogo) {
                // If old value is already a full URL, keep as-is
                if (str_starts_with($rawLogo, 'http')) {
                    $logoUrl = $rawLogo;
                } else {
                    // Stored as relative path like "logos/logo.png"
                    $logoUrl = asset('storage/' . ltrim($rawLogo, '/'));
                }
            }

            return Inertia::render('Settings/Index', [
                'settings' => [
                    'company_name' => $settings['company_name'] ?? 'pamela-inventory',
                    'company_logo' => $logoUrl,
                ],
            ]);
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to load settings.');
        }
    }

    public function update(Request $request)
    {
        try {
            // Only admin can update settings
            abort_unless(Auth::user()?->role === 'admin', 403);

            $current = $this->settings->all();

            $validated = $request->validate([
                'company_name' => ['required', 'string', 'max:255'],
                'company_logo' => ['nullable', 'image', 'max:2048'],
            ]);

            // Save company name
            $this->settings->set('company_name', $validated['company_name']);

            // Start from existing logo value (could be URL or path)
            $newLogoPath = $current['company_logo'] ?? null;

            // If a new logo file is uploaded
            if ($request->hasFile('company_logo')) {
                // If old logo looks like a path (not URL), try to delete file
                if (!empty($current['company_logo']) && !str_starts_with($current['company_logo'], 'http')) {
                    if (Storage::disk('public')->exists($current['company_logo'])) {
                        Storage::disk('public')->delete($current['company_logo']);
                    }
                }

                // Store new file on "public" disk -> returns path like "logos/xxxx.png"
                $newLogoPath = $request->file('company_logo')->store('logos', 'public');

                // Save only the path
                $this->settings->set('company_logo', $newLogoPath);
            }

            // Audit log: store raw stored values (not URLs)
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
                        'company_logo' => $newLogoPath,
                    ],
                ]
            );

            return redirect()
                ->route('settings.index')
                ->with('success', 'Settings updated successfully.');
        } catch (Throwable $e) {
            return $this->handleException($request, $e, 'Unable to update settings.');
        }
    }
}
