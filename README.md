# Svampkartan

Privat PWA för att spara svampställen på kartan. Steg 1: appskal, Kantarell-tema (ljust/mörkt), ikoner, offline-stöd och inloggning med e-postkod via Supabase.

## Kom igång

### 1. GitHub
1. Skapa ett tomt repo `svampkartan`.
2. Lägg upp filerna i roten.
3. Settings → Pages → Deploy from branch → `main` / `(root)`.
4. Appen hamnar på `https://dennishoglund.github.io/svampkartan/`.

### 2. Supabase
1. Skapa ett nytt projekt `svampkartan` (region: Stockholm/eu-north-1 om möjligt).
2. **Authentication → Sign In / Providers → Email**: ska vara på.
3. **Authentication → Emails → Templates → Magic Link**: byt innehåll så att koden syns:

   Ämne: `Din kod till Svampkartan`

   ```html
   <h2>Svampkartan</h2>
   <p>Din inloggningskod:</p>
   <p style="font-size:28px;letter-spacing:4px"><strong>{{ .Token }}</strong></p>
   <p>Koden gäller i en timme.</p>
   ```
4. **Authentication → URL Configuration → Site URL**: `https://dennishoglund.github.io/svampkartan/`
5. **Project Settings → API**: kopiera Project URL och publishable/anon key till `config.js`.

### 3. Första inloggningen
1. Öppna appen i Safari, logga in med din e-post och koden.
2. **Viktigt:** gå sedan till Authentication → Sign In / Providers och stäng av **Allow new users to sign up**. Då kan ingen annan skapa konto.

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
