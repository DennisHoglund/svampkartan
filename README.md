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
| `sw.js` | Offline: appfiler nätet först, kartrutor cachas (max 1500) |
| `manifest.webmanifest` | PWA-inställningar |
| `icons/` | Kartnålsikonen i alla storlekar |

## Bra att veta
- Apparna ligger på samma domän och samma Supabase-projekt, så inloggningen kan delas mellan Svampkartan och Jaktvind.
- iPhone sparar lösenordet i nyckelringen och fyller i med Face ID.

## Nästa steg
4. Lägg till fynd
