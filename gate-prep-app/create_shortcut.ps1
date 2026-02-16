$WshShell = New-Object -comObject WScript.Shell
$CurrentDir = Get-Location
$ShortcutPath = Join-Path $CurrentDir "GATE Nexus.lnk"
$Target = Join-Path $CurrentDir "Launch_App.bat"

# --- CUSTOM ICON SETTING ---
# REPLACE the path below with the absolute path to your .ico file.
# Example: $IconPath = "C:\Suraj\MY_OS\GATE PREP\gate-prep-app\logo.ico"
# If you don't have one yet, keep "shell32.dll, 23" for the default blue book.
$IconPath = "C:\Suraj\MY_OS\GATE PREP\gate-prep-app\albert_einstein_avatar_icon_263209.ico"
# ---------------------------

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $Target
$Shortcut.IconLocation = $IconPath
$Shortcut.Description = "Launch GATE Nexus App"
$Shortcut.WindowStyle = 7 # Minimized
$Shortcut.Save()

Write-Host "Shortcut 'GATE Nexus' created successfully with icon."