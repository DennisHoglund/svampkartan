# Svampkartan – instruktioner för AI-assistenter

Läs `SPEC.md` för hela specifikationen. Det här är reglerna som gäller vid varje ändring.

## Projektet
- Privat PWA för svampställen, en användare (Dennis), används på iPhone i skogen.
- Ren HTML/CSS/JS **utan byggsteg**. Inga ramverk, ingen bundler. Bibliotek via CDN med låst version.
- Supabase (auth + Postgres + Storage), Leaflet, Open-Meteo, GitHub Pages via Actions.

## Språk och ton
- All UI-text, felmeddelanden, kommentarer, commit-meddelanden och testnamn på **svenska**.
- Kort och praktiskt. Felmeddelanden säger vad som hände och vad man kan göra.

## Får aldrig brytas
- **Supabase-projektet delas med Jaktvind.** Rör aldrig tabellerna `logg`, `platser`, Jaktvinds inställningar, auth-inställningar eller mejlmallar.
  Allt eget har prefixet `svamp_` (tabeller, index, policies) och bucketen heter `svamp-foton`.
- Schemaändringar görs i `supabase/schema.sql` och ska gå att köra flera gånger (`if not exists`, `drop policy if exists`).
- RLS på alla tabeller: bara `auth.uid() = user_id`. `anon` får inget.
- Inga hemligheter i koden. Endast den publika publishable-nyckeln i `config.js`.
- Ett fynd får aldrig gå förlorat: spara lokalt (IndexedDB via `ko.js`) först, ladda upp sedan.
- Foton i IndexedDB som **ArrayBuffer**, aldrig Blob (Safari privat läge/WebKit).
- Foton ≤ 250 kB JPEG. Ladda aldrig upp originalbilder.

## Vid varje ändring
1. Höj `CACHE`-versionen i `sw.js` (`svampkartan-vN`) när appfiler ändras, och lägg nya filer i `SHELL`.
2. Nya JS-filer: lägg till `<script>` i `index.html` och i `SHELL`.
3. Kör testerna: `npx playwright test` (lokalt räcker `--project="Android (Chromium)"` om WebKit saknas).
4. Lägg till eller uppdatera tester i `tests/` för ny funktionalitet. All extern trafik mockas i `tests/mock.js`.
   Använd `bild(page, 'Namn')` för skärmdumpar som ska synas i rapporten.
5. Lägg till eller uppdatera testfall i `testplan/` (fil i `testfall/` + rad i `index.md`) och koppla automatiserade tester med
   `{ annotation: { type: 'testfall', description: 'TC-…' } }`. Kör `npm run testplan`.
6. Uppdatera `SPEC.md` (och `README.md` vid behov) så att den stämmer med koden.
7. Committa med beskrivande svenskt meddelande och pusha till `main`. CI testar och publicerar.

## Design
- Färgprofil **Kantarell** med ljust och mörkt läge via CSS-variabler i `styles.css` (`:root`, `prefers-color-scheme`, `[data-theme]`).
  Använd alltid variablerna, aldrig hårdkodade färger.
- Stora tryckytor (≥ 44 px), läsbart i sol, `env(safe-area-inset-*)` för iPhone.
- Kartväljaren är Leaflets standardkontroll, samma som Jaktvind – styla inte om den.
- Generella `input`/`label`-regler ska begränsas till appens formulär (`#form-login`, `#form-fynd`) så att Leaflet inte påverkas.

## Kod
- Moduler som IIFE på `window` (`SvampMap`, `SvampFynd`, `SvampKo`, `SvampVader`).
- `localStorage` alltid i try/catch. Nycklar börjar med `svamp-`.
- Escapa all användartext som hamnar i HTML (`esc()`).

## Tester och rapport
- Playwright på iPhone 14 (WebKit) och Pixel 7 (Chromium).
- Egen rapport: `tests/rapport-reporter.js` → https://dennishoglund.github.io/svampkartan/rapport/
- Ett rött test i WebKit men grönt i Chromium betyder oftast ett riktigt Safari-problem – fixa appen, inte testet.
