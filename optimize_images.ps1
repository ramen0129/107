Add-Type -AssemblyName System.Drawing

$files = @(
    @{ In = "ren_portrait.jpg"; Out = "ren_portrait_opt.jpg"; Name = "CHAR_IMG_REN" },
    @{ In = "elena_portrait.jpg"; Out = "elena_portrait_opt.jpg"; Name = "CHAR_IMG_ELENA" },
    @{ In = "daniel_portrait.jpg"; Out = "daniel_portrait_opt.jpg"; Name = "CHAR_IMG_DANIEL" }
)

$b64Dict = @{}
$jsOutput = "// ==========================================================================`n// OPTIMIZED CHARACTER PORTRAIT ASSETS (Lightweight Base64 Data URIs for GAS / Clasp)`n// ==========================================================================`n`n"

foreach ($f in $files) {
    if (Test-Path $f.In) {
        $origImg = [System.Drawing.Image]::FromFile((Resolve-Path $f.In).Path)
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
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]75)
        
        $resizedImg.Save($f.Out, $encoder, $encoderParams)
        
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
        
        $sizeKB = [math]::Round($bytes.Length / 1024, 1)
        Write-Host "Optimized $($f.Name): $sizeKB KB (Saved as $($f.Out))"
    }
}

$jsOutput += "const CHARACTER_IMAGES = {`n  A: CHAR_IMG_REN,`n  B: CHAR_IMG_ELENA,`n  C: CHAR_IMG_DANIEL`n};`n"

[System.IO.File]::WriteAllText((Join-Path (Get-Location) "character_images_optimized_base64.js"), $jsOutput, [System.Text.Encoding]::UTF8)
($b64Dict | ConvertTo-Json) | Out-File -FilePath (Join-Path (Get-Location) "character_images_optimized_base64.json") -Encoding utf8

Write-Host "Optimized Base64 conversion complete!"
