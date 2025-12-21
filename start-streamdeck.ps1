# ===== StreamDeck local watchdog launcher =====
$Port = 3721
$ProjectDir = "C:\streamdeck"
$NodeExe = "C:\Program Files\nodejs\node.exe"
$ServerFile = "server.js"

# Si le port écoute déjà, on ne relance pas
try {
  $listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  if ($listening) { exit 0 }
} catch {
  # OK si pas de connexion
}

# Lance le serveur en arrière-plan (sans fenêtre)
Start-Process -FilePath $NodeExe `
  -ArgumentList $ServerFile `
  -WorkingDirectory $ProjectDir `
  -WindowStyle Hidden
