Param(
    [Parameter(Mandatory = $true)]
    [string]$Version,                # e.g. 1.0.2

    [ValidateSet("release", "hotfix")]
    [string]$Type = "release",

    [string]$Description = ""        # used only for hotfix branch name
)

$ErrorActionPreference = "Stop"

Write-Host "=== Pamela Inventory Release Tool ===" -ForegroundColor Cyan
Write-Host "Target version: v$Version"
Write-Host "Type: $Type"

# 1. Build branch name
if ($Type -eq "hotfix" -and $Description) {
    # hotfix/v1.0.2-login-bug
    $safeDesc = $Description.Replace(" ", "-")
    $branchName = "hotfix/v$Version-$safeDesc"
}
elseif ($Type -eq "hotfix") {
    $branchName = "hotfix/v$Version"
}
else {
    # release/v1.0.2
    $branchName = "$Type/v$Version"
}

Write-Host "Branch: $branchName"
Write-Host ""

# 2. Ensure we run from repo root (optional: uncomment and hardcode path)
# Set-Location "F:\wamp64\www\pam-inv-dev\pamela-inventory"

# 3. Sync nativeb
Write-Host "Checking out nativeb and pulling latest..." -ForegroundColor Yellow
git checkout nativeb
git pull origin nativeb

# 4. Create version branch
Write-Host "Creating branch $branchName..." -ForegroundColor Yellow
git checkout -b $branchName

# 5. Update .env
$envPath = ".env"
if (Test-Path $envPath) {
    Write-Host "Updating .env versions..." -ForegroundColor Yellow

    # Read full file, normalize line endings to `\n`, then split lines
    $raw = [System.IO.File]::ReadAllText($envPath)
    $raw = $raw -replace "`r`n", "`n"
    $lines = $raw -split "`n"

    # Helper to update or append a key=value line
    function Set-Or-AddEnvLine {
        param(
            [string[]]$Lines,
            [string]$Key,
            [string]$Value
        )

        $pattern = "^$Key="
        $index = $Lines.FindIndex({ $_ -match $pattern })

        if ($index -ge 0) {
            $Lines[$index] = "$Key=$Value"
        } else {
            $Lines += "$Key=$Value"
        }

        return ,$Lines
    }

    # Add a helper on the array type
    Update-TypeData -TypeName System.Object -MemberType ScriptMethod -MemberName FindIndex -Value {
        param([scriptblock]$predicate)
        for ($i = 0; $i -lt $this.Length; $i++) {
            if (& $predicate $this[$i]) { return $i }
        }
        return -1
    } -Force | Out-Null

    $lines = Set-Or-AddEnvLine -Lines $lines -Key "APP_VERSION" -Value $Version
    $lines = Set-Or-AddEnvLine -Lines $lines -Key "NATIVEPHP_APP_VERSION" -Value $Version

    # Join back with Windows line endings and write file
    $outText = ($lines -join "`r`n") + "`r`n"
    [System.IO.File]::WriteAllText($envPath, $outText, [System.Text.Encoding]::UTF8)
}
else {
    Write-Host ".env not found, skipping .env update." -ForegroundColor Red
}


# 6. Update package.json (if exists)
$packagePath = "package.json"
if (Test-Path $packagePath) {
    Write-Host "Updating package.json version..." -ForegroundColor Yellow
    $jsonText = Get-Content $packagePath -Raw
    $json = $jsonText | ConvertFrom-Json
    $json.version = $Version
    $json | ConvertTo-Json -Depth 10 | Set-Content $packagePath
}
else {
    Write-Host "package.json not found, skipping package version update." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Files updated. Now run the following commands to finalize:" -ForegroundColor Green
Write-Host "  git status"
Write-Host "  git add ."
Write-Host "  git commit -m `"final updates for v$Version $Type`""
Write-Host "  git push -u origin $branchName"
Write-Host ""
Write-Host "Then tag + push:" -ForegroundColor Green
Write-Host "  git tag v$Version"
Write-Host "  git push origin v$Version"
Write-Host ""
