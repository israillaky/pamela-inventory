<?php

namespace App\Http\Controllers\Desktop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DesktopUpdateController extends Controller
{
    public function show(Request $request)
    {
        $backendVersion = config('app.version');          // from APP_VERSION
        $desktopVersion = config('nativephp.version');    // from NATIVEPHP_APP_VERSION

        // Convention: tags are `vX.Y.Z`
        $tag = 'v' . $desktopVersion;

        return response()->json([
            'backend_version' => $backendVersion,
            'desktop_version' => $desktopVersion,
            'tag'             => $tag,
            'release_url'     => "https://github.com/israillaky/pamela-inventory/releases/tag/{$tag}",
            // you can add more fields later if you want:
            // 'changelog' => ...
        ]);
    }
}
