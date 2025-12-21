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

Ouvrir ensuite: http://localhost:3000

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
