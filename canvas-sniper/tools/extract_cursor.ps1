Add-Type -AssemblyName System.Drawing

$cursorPath = (Get-ItemProperty -Path 'HKCU:\Control Panel\Cursors' -Name Arrow).Arrow
if (-not $cursorPath) {
    $cursorPath = "$env:SystemRoot\Cursors\aero_arrow.cur"
}

$cursorPath = [System.Environment]::ExpandEnvironmentVariables($cursorPath)

if (-not (Test-Path $cursorPath)) {
    $cursorPath = "C:\Windows\Cursors\aero_arrow.cur"
}

try {
    # Try loading as Icon first (better color fidelity for multi-depth files)
    $icon = [System.Drawing.Icon]::new($cursorPath)
    $bitmap = $icon.ToBitmap()
    $icon.Dispose()
}
catch {
    try {
        # Fallback to Cursor class if Icon fails (some .cur formats)
        Add-Type -AssemblyName System.Windows.Forms
        $cursor = [System.Windows.Forms.Cursor]::new($cursorPath)
        $bitmap = New-Object System.Drawing.Bitmap(32, 32)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $cursor.Draw($graphics, [System.Drawing.Rectangle]::new(0, 0, 32, 32))
        $graphics.Dispose()
        $cursor.Dispose()
    }
    catch {
        Write-Error "Failed to load cursor: $_"
        exit 1
    }
}

# Save as PNG
$ms = New-Object System.IO.MemoryStream
$bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$base64 = [Convert]::ToBase64String($ms.ToArray())
$bitmap.Dispose()
$ms.Dispose()

Write-Output "data:image/png;base64,$base64"
