<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Traits\LogActivityTrait;


class UserController extends Controller
{
    use LogActivityTrait;

    public function index(Request $request)
    {
        abort_unless(Auth::user()?->role === 'admin', 403);

        $search = $request->string('search')->toString();

        $users = User::query()
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')  // newest first
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users, // MUST be paginator
            'filters' => ['search' => $search],
            'roles' => ['admin','staff','warehouse_manager','cashier'],
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(Auth::user()?->role === 'admin', 403);

        $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'username' => ['required','string','max:50','unique:users,username'],
            'email' => ['nullable','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'role' => ['required', Rule::in(['admin','staff','warehouse_manager','cashier'])],
        ]);

        $user = User::create($validated);

        $this->logActivity(
            'created',
            'users',
            "Admin created user: {$user->name} (ID: {$user->id})"
        );

        return back()->with('success', 'User created.');
    }

    public function update(Request $request, User $user)
    {
        abort_unless(Auth::user()?->role === 'admin', 403);

        $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'username' => ['required','string','max:50', Rule::unique('users','username')->ignore($user->id)],
            'email' => ['nullable','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'password' => ['nullable','string','min:6'],
            'role' => ['required', Rule::in(['admin','staff','warehouse_manager','cashier'])],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        $this->logActivity(
            'updated',
            'users',
            "Admin updated user: {$user->name} (ID: {$user->id})"
        );

        return back()->with('success', 'User updated.');
    }

    public function destroy(User $user)
    {
        abort_unless(Auth::user()?->role === 'admin', 403);

        if ($user->id === Auth::id()) {
            return back()->with('error', "You can't delete your own account.");
        }
        $this->logActivity(
            'deleted',
            'users',
            "Admin deleted user: {$user->name} (ID: {$user->id})"
        );

        $user->delete();

        return back()->with('success', 'User deleted.');
    }
}
