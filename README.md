# Svampkartan

Privat PWA för att spara svampställen på kartan. Steg 1: appskal, Kantarell-tema (ljust/mörkt), ikoner, offline-stöd och inloggning med e-postkod via Supabase.

## Kom igång

### 1. GitHub
1. Skapa ett tomt repo `svampkartan`.
2. Lägg upp filerna i roten.
3. Settings → Pages → Deploy from branch → `main` / `(root)`.
4. Appen hamnar på `https://dennishoglund.github.io/svampkartan/`.

### 2. Supabase (delar projekt med Jaktvind)
Svampkartan använder Jaktvinds Supabase-projekt eftersom gratisnivån bara tillåter två projekt.
Allt eget har prefix så att Jaktvinds tabeller (`logg`, `platser`) aldrig berörs:
- tabeller: `svamp_*`
- bucket: `svamp-foton`

Enda inställningen som ändras:
**Authentication → Emails → Templates → Magic Link** – visa koden. Jaktvind loggar in med lösenord och använder inte den här mallen.

Ämne: `Din kod till Svampkartan`

```html
<h2>Svampkartan</h2>
<p>Din inloggningskod:</p>
<p style="font-size:28px;letter-spacing:4px"><strong>{{ .Token }}</strong></p>
<p>Koden gäller i en timme.</p>
```

Site URL och registreringsinställningar lämnas orörda. Logga in med samma e-post som i Jaktvind – det är samma konto.

### 3. Första inloggningen
Öppna `https://dennishoglund.github.io/svampkartan/` i Safari och logga in med e-post och kod.

### 4. Installera på iPhone
Safari → Dela → **Lägg till på hemskärmen**.

## Filer
| Fil | Innehåll |
|---|---|
| `index.html` | Inloggning och appvy |
| `styles.css` | Kantarell-tema, ljust/mörkt via `prefers-color-scheme` + manuellt val |
| `app.js` | Tema, inloggning med kod, session |
| `config.js` | Supabase-URL och nyckel |
| `sw.js` | Offline-cache – höj `CACHE`-versionen vid varje deploy |
| `manifest.webmanifest` | PWA-inställningar |
| `icons/` | Kartnålsikonen i alla storlekar |

## Bra att veta
- Supabase inbyggda e-post har en låg gräns för antal mejl per timme. Det räcker för en användare.
- Om iPhone stänger appen medan du hämtar koden i Mail ligger kodsteget kvar när du öppnar den igen.
- Koden autofylls ofta från Mail ovanför tangentbordet.

## Nästa steg
2. Tabell `fynd`, RLS och privat bucket för foton
3. Karta med lager och din position
4. Lägg till fynd
