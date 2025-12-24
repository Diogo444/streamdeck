# Stream Deck Windows Launcher

Interface locale pour lancer des applications et sites Windows via une API Node.js. UI Tailwind CSS (CLI), serveur Express.

## Pre-requis
- Windows 10/11
- Node.js 18+
- PNPM

## Installation
```bash
pnpm install
```

## Build CSS
```bash
pnpm run build:css
```

## Dev CSS (watch)
```bash
pnpm run watch:css
```

## Lancer le serveur
```bash
pnpm run dev
```

Ouvrir ensuite: http://localhost:3721

## Démarrage automatique (Windows)
Ce projet lance des applis **GUI** (VS Code, Discord, etc.) via `cmd /c start`. Pour que ces fenêtres s’ouvrent bien sur ton bureau, le serveur doit tourner dans ta **session utilisateur** (pas en “Session 0”). C’est pour ça que la méthode **Planificateur de tâches** est généralement la plus fiable.

### Option 1 — Planificateur de tâches (recommandé)
Le repo inclut `start-streamdeck.ps1` (idempotent : ne relance pas si le port est déjà en écoute).

1) Vérifie les variables dans `start-streamdeck.ps1`:
- `$ProjectDir` (par défaut `C:\streamdeck`)
- `$NodeExe` (ex: `C:\Program Files\nodejs\node.exe`)
- `$Port` (doit matcher `server.js`, par défaut `3721`)

2) Crée une tâche (GUI):
- Ouvre `taskschd.msc` → “Créer une tâche…” (pas “Créer une tâche de base”).
- Onglet **Général**: “Exécuter uniquement lorsque l’utilisateur est connecté” (important pour lancer des apps).
- Onglet **Déclencheurs**: ajoute au minimum “À l’ouverture de session” (optionnel: “Au démarrage” + “Au déverrouillage de la station de travail”).
- Onglet **Actions**:
  - Programme/script: `powershell.exe`
  - Arguments: `-NoProfile -ExecutionPolicy Bypass -File "C:\streamdeck\start-streamdeck.ps1"`

Option ligne de commande (logon):
```bat
schtasks /Create /TN "StreamDeck Server" /SC ONLOGON /RL HIGHEST /F /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"C:\streamdeck\start-streamdeck.ps1\""
```

Option “unlock/lock” avancée (par événements):
- Déverrouillage: journal **Security**, source **Microsoft-Windows-Security-Auditing**, Event ID **4801**
- Verrouillage: journal **Security**, source **Microsoft-Windows-Security-Auditing**, Event ID **4800**
> Si tu ne vois pas ces événements, active l’audit “Logon/Logoff” (souvent “Audit Other Logon/Logoff Events”) dans la stratégie de sécurité.

### Option 2 — Service Windows (SCM)
⚠️ Un service Windows tourne en **Session 0** : c’est parfait pour un serveur “headless”, mais ça peut empêcher l’ouverture d’apps GUI dans ta session. Si ton objectif est de lancer des applis sur ton bureau, préfère l’Option 1.

Pour un vrai service, il faut un **wrapper** (car `node.exe` / `server.js` ne sont pas des binaires “service” nativement), par exemple WinSW/NSSM, ou bien un Worker Service .NET.

#### Exemple avec WinSW (wrapper)
1) Télécharge WinSW (x64), renomme l’exe en `StreamDeckService.exe` et place-le par exemple dans `C:\streamdeck\service\`.
2) Crée `C:\streamdeck\service\StreamDeckService.xml` (même nom que l’exe):

```xml
<service>
  <id>StreamDeckServer</id>
  <name>StreamDeck Server</name>
  <description>Serveur StreamDeck (Node.js)</description>
  <executable>C:\Program Files\nodejs\node.exe</executable>
  <arguments>C:\streamdeck\server.js</arguments>
  <workingdirectory>C:\streamdeck</workingdirectory>
  <logpath>C:\streamdeck\logs</logpath>
  <startmode>Automatic</startmode>
  <onfailure action="restart" delay="5 sec" />
</service>
```

3) Installe et démarre (PowerShell en admin):
```powershell
cd C:\streamdeck\service
.\StreamDeckService.exe install
.\StreamDeckService.exe start
```

Gestion ensuite via `services.msc`, `sc.exe`, `Start-Service` / `Stop-Service`.

#### Variante 100% Microsoft (.NET Worker Service)
- Doc: https://learn.microsoft.com/en-us/dotnet/core/extensions/windows-service
- Idée: créer un Worker Service qui démarre `node.exe server.js`, le publier en `.exe`, puis l’enregistrer via `sc.exe create` ou `New-Service`.

### Conseils fiabilité
- Active “Redémarrer en cas d’échec” (Planificateur) ou `onfailure` (service wrapper).
- Ajoute des logs (`C:\streamdeck\logs\...`) pour diagnostiquer les démarrages au boot/logon.
- Si tu changes le port dans `server.js`, mets à jour `start-streamdeck.ps1` (et la tâche/service).

## Fonctionnement
- L'UI envoie un POST vers `/api/launch`.
- Le serveur execute une commande Windows via `cmd /c start`.
- Les actions autorisees sont definies dans `server.js` (whitelist).

## Ajouter une action (app ou site)
1) Ajouter une entree dans `ACTIONS` de `server.js`:

```js
const ACTIONS = {
  ...,
  monAction: {
    label: "Mon App",
    command: 'cmd /c start "" "https://example.com"',
  },
};
```

Pour une app locale, utiliser un chemin ou un protocole:
```js
command: 'cmd /c start "" "C:\\Program Files\\MonApp\\MonApp.exe"'
```

2) Ajouter une tuile dans `public/index.html`:

```html
<button class="deck-tile" type="button" data-action="monAction" data-label="Mon App">
  <!-- contenu visuel -->
</button>
```

3) Regenerer le CSS si tu as modifie les classes:
```bash
pnpm run build:css
```

## Ajuster le theme
- Styles globaux: `public/input.css`
- Build Tailwind: `public/style.css`
- Mode sombre: bouton dans l'UI + detection `prefers-color-scheme`

## Securite
- L'API n'accepte que les actions listees dans `ACTIONS`.
- Evite d'exposer ce serveur sur un reseau public.

## Depannage
- VS Code ne se lance pas: verifier le chemin auto dans `server.js`.
- Rien ne se passe: verifier que Windows autorise l'ouverture du protocole/app.

## Structure
- `server.js`: serveur Express + commandes Windows
- `public/index.html`: interface + JS client
- `public/input.css`: source Tailwind
- `public/style.css`: CSS genere
- `tailwind.config.js`: config Tailwind
