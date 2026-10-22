# Svampkartan

Privat PWA för att spara svampställen på kartan. Steg 1: appskal, Kantarell-tema (ljust/mörkt), ikoner, offline-stöd och inloggning via Supabase.

## Kom igång

### 1. GitHub
1. Skapa ett tomt repo `svampkartan`.
2. Lägg upp filerna i roten.
3. Settings → Pages → Deploy from branch → `main` / `(root)`.
4. Appen hamnar på `https://dennishoglund.github.io/svampkartan/`.

### 2. Supabase (delar projekt med Jaktvind)
Svampkartan använder Jaktvinds Supabase-projekt eftersom gratisnivån bara tillåter två projekt.
Inloggning sker med e-post och lösenord – samma konto som i Jaktvind. Inga inställningar i Supabase ändras.

Allt eget har prefix så att Jaktvinds tabeller (`logg`, `platser`) aldrig berörs:
- tabeller: `svamp_*`
- bucket: `svamp-foton`

### 2b. Databas och foton
Supabase → SQL Editor → New query → klistra in `supabase/schema.sql` → Run.
Skapar tabellen `svamp_fynd`, bucketen `svamp-foton` och reglerna – rör inget av Jaktvinds.

### 3. Första inloggningen
Öppna `https://dennishoglund.github.io/svampkartan/` i Safari och logga in med samma e-post och lösenord som i Jaktvind.

### 4. Installera på iPhone
Safari → Dela → **Lägg till på hemskärmen**.

## Filer
| Fil | Innehåll |
|---|---|
| `index.html` | Inloggning och appvy |
| `styles.css` | Kantarell-tema, ljust/mörkt via `prefers-color-scheme` + manuellt val |
| `app.js` | Tema, inloggning, session |
| `config.js` | Supabase-URL och nyckel |
| `map.js` | Karta, lager, min position, fyndmarkörer |
| `arter.js` | Arter med namn och färg |
| `vader.js` | Regn och temperatur 10 dygn före fyndet (Open-Meteo) |
| `ko.js` | Offline-kö i IndexedDB, laddar upp när täckning finns |
| `fynd.js` | Nytt fynd, foto, spara, ta bort |
| `sw.js` | Offline: appfiler nätet först, kartrutor cachas (max 1500) |
| `manifest.webmanifest` | PWA-inställningar |
| `icons/` | Kartnålsikonen i alla storlekar |

## Bra att veta
- Apparna ligger på samma domän och samma Supabase-projekt, så inloggningen kan delas mellan Svampkartan och Jaktvind.
- iPhone sparar lösenordet i nyckelringen och fyller i med Face ID.

## Nästa steg
7. Filter och säsongsvy

## Tester

Playwright-tester körs automatiskt vid varje push till `main` i GitHub Actions, på iPhone (WebKit) och Android (Chromium).
All extern trafik mockas (Supabase, kartrutor, Open-Meteo), så testerna rör aldrig riktig data.

- **Testrapport:** https://dennishoglund.github.io/svampkartan/rapport/
- **Testplan:** [`testplan/index.md`](testplan/index.md) – alla testfall med steg för steg
- **Detaljerad rapport med spårning:** https://dennishoglund.github.io/svampkartan/rapport/playwright/

Köra lokalt:

```bash
npm ci
npx playwright install webkit chromium
npm test            # alla tester
npm run test:ui     # Playwrights UI-läge
npm run rapport     # öppna rapporten
```

| Fil | Innehåll |
|---|---|
| `tests/mock.js` | Mockad Supabase, CDN, kartrutor och väder |
| `tests/hjalp.js` | Fixturer (`api`, `kartan`) och `bild()` för skärmdumpar |
| `tests/*.spec.js` | Inloggning, karta, nytt fynd, offline, tema |
| `tests/rapport-reporter.js` | Egen rapport i Kantarell-stil med trend och skärmdumpar |
| `.github/workflows/tester.yml` | Testar och publicerar app + rapport till GitHub Pages |

**GitHub Pages källa:** Settings → Pages → Source: **GitHub Actions**.
