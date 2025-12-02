Param(
    [Parameter(Mandatory = $true)]
    [string]$Version,                # e.g. 1.0.0

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
    # hotfix/v1.0.1-login-bug
    $safeDesc = $Description.Replace(" ", "-")
    $branchName = "hotfix/v$Version-$safeDesc"
}
else {
    # release/v1.0.0
    $branchName = "$Type/v$Version"
}

Write-Host "Branch: $branchName"
Write-Host ""

# 2. Ensure we are in repo root
# (You can hardcode path if you want)
# Set-Location "C:\wamp64\www\pamela-inventory"

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
    (Get-Content $envPath) `
        -replace '^APP_VERSION=.*', "APP_VERSION=$Version" `
        -replace '^NATIVEPHP_APP_VERSION=.*', "NATIVEPHP_APP_VERSION=$Version" |
        Set-Content $envPath
}
else {
    Write-Host ".env not found, skipping .env update." -ForegroundColor Red
}

# 6. Update package.json (if exists)
$packagePath = "package.json"
if (Test-Path $packagePath) {
    Write-Host "Updating package.json version..." -ForegroundColor Yellow
    $json = Get-Content $packagePath -Raw | ConvertFrom-Json
    $json.version = $Version
    $json | ConvertTo-Json -Depth 10 | Set-Content $packagePath
}
else {
    Write-Host "package.json not found, skipping package version update." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Files updated. Run the following to finalize:" -ForegroundColor Green
Write-Host "  git status"
Write-Host "  git add ."
Write-Host "  git commit -m `"final updates for v$Version $Type`""
Write-Host "  git push -u origin $branchName"
Write-Host ""
Write-Host "Then tag + push:" -ForegroundColor Green
Write-Host "  git tag v$Version"
Write-Host "  git push origin v$Version"
Write-Host ""
Write-Host "After that, deploy backend + run:" -ForegroundColor Green
Write-Host "  php artisan native:publish"
