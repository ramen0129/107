Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\佐々木篤史\.gemini\antigravity-ide\brain\80bb2e4c-db57-409e-a4bf-db538a50befb"
$outDir = "c:\Users\佐々木篤史\Desktop\pallarerujapania"

$files = @(
    @{ Name = "CHAR_IMG_REN"; In = "ren_freedom_portrait_1788490222613.jpg"; Out = "ren_portrait_thumb.jpg" },
    @{ Name = "CHAR_IMG_ELENA"; In = "elena_equality_portrait_1788490241158.jpg"; Out = "elena_portrait_thumb.jpg" },
    @{ Name = "CHAR_IMG_DANIEL"; In = "daniel_social_portrait_1788490258039.jpg"; Out = "daniel_portrait_thumb.jpg" }
)

$b64Dict = @{}
$jsOutput = "// ==========================================================================`n// CHARACTER PORTRAIT ASSETS (Base64 Data URIs for Clasp / Standalone Web Apps)`n// ==========================================================================`n`n"

foreach ($f in $files) {
    $srcPath = Join-Path $srcDir $f.In
    $destPath = Join-Path $outDir $f.Out
    
    $origImg = [System.Drawing.Image]::FromFile($srcPath)
    $targetWidth = 480
    $targetHeight = [int]($origImg.Height * ($targetWidth / $origImg.Width))
    
    $resizedImg = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
    $graphics = [System.Drawing.Graphics]::FromImage($resizedImg)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($origImg, 0, 0, $targetWidth, $targetHeight)
    
    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]80)
    
    $resizedImg.Save($destPath, $encoder, $encoderParams)
    
    $ms = New-Object System.IO.MemoryStream
    $resizedImg.Save($ms, $encoder, $encoderParams)
    $bytes = $ms.ToArray()
    $b64Str = "data:image/jpeg;base64," + [Convert]::ToBase64String($bytes)
    
    $b64Dict[$f.Name] = $b64Str
    $jsOutput += "const " + $f.Name + " = `"" + $b64Str + "`";`n`n"
    
    $graphics.Dispose()
    $resizedImg.Dispose()
    $origImg.Dispose()
    $ms.Dispose()
    
    Write-Host ("Processed: " + $f.Name + " Size: " + [math]::Round($bytes.Length / 1024, 2) + " KB")
}

$jsOutput += "const CHARACTER_IMAGES = {`n  A: CHAR_IMG_REN,`n  B: CHAR_IMG_ELENA,`n  C: CHAR_IMG_DANIEL`n};`n"

$jsPath = Join-Path $outDir "character_images_base64.js"
[System.IO.File]::WriteAllText($jsPath, $jsOutput, [System.Text.Encoding]::UTF8)

$jsonPath = Join-Path $outDir "character_images_base64.json"
($b64Dict | ConvertTo-Json) | Out-File -FilePath $jsonPath -Encoding utf8

Write-Host "Base64 conversion complete!"
