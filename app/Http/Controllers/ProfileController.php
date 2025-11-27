<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Models\User;
use App\Traits\LogActivityTrait;


class ProfileController extends Controller
{
    /**
     * Show profile form (all roles).
     */
    use LogActivityTrait;

    public function edit(Request $request): Response
    {
        abort_unless(Auth::check(), 403);

        return Inertia::render('Profile/Edit', [
            'user'   => Auth::user(),   // IMPORTANT: needed by your React page
            'status' => session('status'),
        ]);
    }

    /**
     * Update self profile.
     */
    public function update(Request $request)
    {
        abort_unless(Auth::check(), 403);

        /** @var \App\Models\User $user */
        $user = $request->user();  // same as Auth::user(), but IDE-friendly

        $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'username' => ['required','string','max:50', Rule::unique('users','username')->ignore($user->id)],
            'email' => ['nullable','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'password' => ['nullable','string','min:6','confirmed'],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();
        $this->logActivity(
            'updated',
            'users',
            'User updated own profile'
        );

        return Redirect::route('profile.edit')->with('success', 'Profile updated.');
    }


    /**
     * Delete own account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        abort_unless(Auth::check(), 403);

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();  // same as Auth::user(), but IDE-friendly
        $this->logActivity(
            'deleted',
            'users',
            'User deleted own account'
        );

        Auth::logout();
        $user->delete();


        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
