Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ----------------------------------------
# Helper: run the existing CLI script
# ----------------------------------------
function Run-PamelaRelease {
    param(
        [string]$Version,
        [string]$Type,
        [string]$Description
    )

    $scriptPath = Join-Path $PSScriptRoot "pamela-release.ps1"

    if (-not (Test-Path $scriptPath)) {
        [System.Windows.Forms.MessageBox]::Show(
            "Cannot find pamela-release.ps1 in:`n$scriptPath",
            "Pamela Release Tool",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-ExecutionPolicy Bypass -File `"$scriptPath`" -Version `"$Version`" -Type `"$Type`" -Description `"$Description`""
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    $process.Start() | Out-Null

    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    return @{
        StdOut = $stdout
        StdErr = $stderr
        ExitCode = $process.ExitCode
    }
}

# ----------------------------------------
# Build GUI
# ----------------------------------------
$form                  = New-Object System.Windows.Forms.Form
$form.Text             = "Pamela Inventory - Release Builder"
$form.Size             = New-Object System.Drawing.Size(520, 420)
$form.StartPosition    = "CenterScreen"
$form.Topmost          = $true

# Version label + textbox
$lblVersion            = New-Object System.Windows.Forms.Label
$lblVersion.Text       = "Version (e.g. 1.0.1):"
$lblVersion.Location   = New-Object System.Drawing.Point(20, 20)
$lblVersion.Size       = New-Object System.Drawing.Size(200, 20)
$form.Controls.Add($lblVersion)

$txtVersion            = New-Object System.Windows.Forms.TextBox
$txtVersion.Location   = New-Object System.Drawing.Point(20, 45)
$txtVersion.Size       = New-Object System.Drawing.Size(200, 25)
$txtVersion.Text       = ""
$form.Controls.Add($txtVersion)

# Type label + radio buttons
$lblType               = New-Object System.Windows.Forms.Label
$lblType.Text          = "Release type:"
$lblType.Location      = New-Object System.Drawing.Point(20, 80)
$lblType.Size          = New-Object System.Drawing.Size(200, 20)
$form.Controls.Add($lblType)

$rbRelease             = New-Object System.Windows.Forms.RadioButton
$rbRelease.Text        = "Release (release/vX.Y.Z)"
$rbRelease.Location    = New-Object System.Drawing.Point(20, 105)
$rbRelease.Size        = New-Object System.Drawing.Size(200, 20)
$rbRelease.Checked     = $true
$form.Controls.Add($rbRelease)

$rbHotfix              = New-Object System.Windows.Forms.RadioButton
$rbHotfix.Text         = "Hotfix (hotfix/vX.Y.Z[-desc])"
$rbHotfix.Location     = New-Object System.Drawing.Point(20, 130)
$rbHotfix.Size         = New-Object System.Drawing.Size(250, 20)
$form.Controls.Add($rbHotfix)

# Description label + textbox (for hotfix)
$lblDesc               = New-Object System.Windows.Forms.Label
$lblDesc.Text          = "Hotfix description (optional):"
$lblDesc.Location      = New-Object System.Drawing.Point(20, 165)
$lblDesc.Size          = New-Object System.Drawing.Size(250, 20)
$form.Controls.Add($lblDesc)

$txtDesc               = New-Object System.Windows.Forms.TextBox
$txtDesc.Location      = New-Object System.Drawing.Point(20, 190)
$txtDesc.Size          = New-Object System.Drawing.Size(300, 25)
$txtDesc.Enabled       = $false
$form.Controls.Add($txtDesc)

# Enable/disable description based on hotfix selection
$rbHotfix.Add_CheckedChanged({
    if ($rbHotfix.Checked) {
        $txtDesc.Enabled = $true
    } else {
        $txtDesc.Enabled = $false
        $txtDesc.Text    = ""
    }
})

# Run button
$btnRun                = New-Object System.Windows.Forms.Button
$btnRun.Text           = "Run Release Script"
$btnRun.Location       = New-Object System.Drawing.Point(20, 230)
$btnRun.Size           = New-Object System.Drawing.Size(180, 30)
$form.Controls.Add($btnRun)

# Close button
$btnClose              = New-Object System.Windows.Forms.Button
$btnClose.Text         = "Close"
$btnClose.Location     = New-Object System.Drawing.Point(220, 230)
$btnClose.Size         = New-Object System.Drawing.Size(100, 30)
$form.Controls.Add($btnClose)

# Output textbox
$lblOutput             = New-Object System.Windows.Forms.Label
$lblOutput.Text        = "Output:"
$lblOutput.Location    = New-Object System.Drawing.Point(20, 270)
$lblOutput.Size        = New-Object System.Drawing.Size(200, 20)
$form.Controls.Add($lblOutput)

$txtOutput             = New-Object System.Windows.Forms.TextBox
$txtOutput.Location    = New-Object System.Drawing.Point(20, 295)
$txtOutput.Size        = New-Object System.Drawing.Size(460, 70)
$txtOutput.Multiline   = $true
$txtOutput.ScrollBars  = "Vertical"
$txtOutput.ReadOnly    = $true
$form.Controls.Add($txtOutput)

# ----------------------------------------
# Button events
# ----------------------------------------
$btnRun.Add_Click({
    $version = $txtVersion.Text.Trim()
    if ([string]::IsNullOrWhiteSpace($version)) {
        [System.Windows.Forms.MessageBox]::Show(
            "Please enter a version (e.g. 1.0.1).",
            "Validation",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        )
        return
    }

    $type = if ($rbHotfix.Checked) { "hotfix" } else { "release" }
    $desc = $txtDesc.Text.Trim()

    $txtOutput.Text = "Running pamela-release.ps1...`r`nVersion: $version`r`nType: $type`r`nDescription: $desc`r`n`r`n"

    $result = Run-PamelaRelease -Version $version -Type $type -Description $desc

    if ($null -ne $result) {
        if ($result.StdOut) {
            $txtOutput.AppendText("STDOUT:`r`n" + $result.StdOut + "`r`n")
        }
        if ($result.StdErr) {
            $txtOutput.AppendText("STDERR:`r`n" + $result.StdErr + "`r`n")
        }
        $txtOutput.AppendText("ExitCode: " + $result.ExitCode + "`r`n")
        $txtOutput.AppendText("Done. Now run the git commands:`r`n")
        $txtOutput.AppendText("  git status`r`n")
        $txtOutput.AppendText("  git add .`r`n")
        $txtOutput.AppendText("  git commit -m `"final updates for v$version $type`"`r`n")
        if ($type -eq 'hotfix' -and $desc) {
            $branchName = "hotfix/v$version-" + $desc.Replace(' ', '-')
        } elseif ($type -eq 'hotfix') {
            $branchName = "hotfix/v$version"
        } else {
            $branchName = "release/v$version"
        }
        $txtOutput.AppendText("  git push -u origin $branchName`r`n")
        $txtOutput.AppendText("  git tag v$version`r`n")
        $txtOutput.AppendText("  git push origin v$version`r`n")
    }
})

$btnClose.Add_Click({
    $form.Close()
})

# ----------------------------------------
# Show form
# ----------------------------------------
[void]$form.ShowDialog()
