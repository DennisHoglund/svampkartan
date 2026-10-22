# Svampkartan – specifikation

> Privat PWA för att spara och hitta tillbaka till svampställen.
> Version: oktober 2026 · Repo: `DennisHoglund/svampkartan` · App: https://dennishoglund.github.io/svampkartan/

---

## 1. Syfte och målgrupp

| | |
|---|---|
| **Syfte** | Markera svampfynd på en karta med art, mängd, foto och anteckning, så att ställena går att hitta igen. Med tiden ska väderdata visa när och efter hur mycket regn respektive art brukar dyka upp. |
| **Användare** | En användare (ägaren). Ingen delning. |
| **Plattform** | iPhone, installerad på hemskärmen som PWA via Safari. Fungerar även i andra moderna webbläsare. |
| **Miljö** | Ute i skogen: stark sol, skymning och ofta dålig eller ingen täckning. |

---

## 2. Teknisk översikt

| Del | Val |
|---|---|
| Frontend | Ren HTML, CSS och JavaScript utan byggsteg |
| Karta | Leaflet 1.9.4 (cdnjs) |
| Backend | Supabase: auth, Postgres och Storage |
| Väder | Open-Meteo (gratis, ingen nyckel) |
| Hosting | GitHub Pages, publiceras via GitHub Actions |
| Offline | Service worker + IndexedDB |
| Test | Playwright 1.56.1 på WebKit och Chromium |

### Filstruktur

| Fil | Ansvar |
|---|---|
| `index.html` | Vyer: laddning, inloggning, karta, formulär för nytt fynd, placeringsläge |
| `styles.css` | Kantarell-tema (ljust och mörkt), komponenter, karta |
| `config.js` | Supabase-URL och publik nyckel |
| `app.js` | Tema, inloggning, session, hämtning av fynd, synk av kön, registrering av service worker |
| `map.js` | Karta, lager, egen position, fyndnålar, popup, placeringsläge, toast |
| `fynd.js` | Formulär för nytt fynd, fotohantering, spara, popupfoto, ta bort, väderkomplettering |
| `vader.js` | Hämtar regn och temperatur för 10 dygn från Open-Meteo |
| `ko.js` | Offline-kö i IndexedDB och uppladdning |
| `arter.js` | Arter med id, namn och färg |
| `sw.js` | Cache för appskal, CDN och kartrutor |
| `manifest.webmanifest`, `icons/` | PWA-inställningar och ikoner |
| `supabase/schema.sql` | Tabell, bucket och behörighetsregler |
| `tests/`, `playwright.config.js` | Testsvit och egen rapport |
| `.github/workflows/tester.yml` | CI: test och publicering |

---

## 3. Design

### 3.1 Färgprofil ”Kantarell”

Appen följer telefonens ljusa eller mörka läge automatiskt. Användaren kan också välja läge manuellt med knappen i toppen, som växlar Auto → Ljust → Mörkt. Valet sparas i `localStorage` (`svamp-theme`).

| Token | Ljust | Mörkt |
|---|---|---|
| `--bg` | `#FBF4E6` | `#1E1912` |
| `--surface` | `#FFFFFF` | `#2B241A` |
| `--surface-2` | `#F3EAD6` | `#3A3226` |
| `--border` | `#E7DFC8` | `#463C2D` |
| `--text` | `#3B2A1A` | `#F3E9D2` |
| `--text-2` | `#7A6650` | `#B8A887` |
| `--accent` | `#E8A317` | `#F0B02A` |
| `--brown` | `#7A5230` | `#C8A07A` |

- I mörkt läge dämpas kartrutor med ett CSS-filter. Satellitlagret undantas.
- `theme-color` uppdateras efter valt läge.

### 3.2 Ikon ”Kartnål”

En mörkbrun kartnål (`#3B2A1A`) med en kantarell (`#F0B02A`) på kantarellgul botten (`#E8A317`). Ikonen finns som SVG och som PNG i storlekarna 180 (Apple), 192, 512 och 512 maskable.

---

## 4. Funktioner

### 4.1 Inloggning

- Inloggning sker med **e-post och lösenord** (`signInWithPassword`). Det är samma konto som i Jaktvind, eftersom apparna delar Supabase-projekt.
- Sessionen sparas och förnyas automatiskt, så användaren förblir inloggad efter omstart.
- E-postformatet valideras innan något skickas.
- Felmeddelandena är på svenska: fel uppgifter, för många försök, ingen kontakt med servern.
- Knappen **Logga ut** finns i toppen.

> Inloggning med e-postkod (OTP) valdes bort, eftersom egna mejlmallar i Supabase kräver egen SMTP-server.

### 4.2 Karta

| Egenskap | Beteende |
|---|---|
| Baslager | Terräng (OpenTopoMap, startlager), Karta (OSM), Stigar (CyclOSM), Satellit (Esri) |
| Överlägg | Vandringsleder (Waymarked Trails) |
| Lagerväljare | Leaflets standardkontroll uppe till höger, samma som i Jaktvind |
| Minne | Valt lager, vandringsleder på eller av, samt kartans position och zoom sparas |
| Startvy | Senast sparade vy. Första gången: Roslagen, sedan hopp till egen position |
| Egen position | Blå punkt med cirkel för noggrannheten. Knappen nere till höger centrerar och följer användaren tills kartan dras |
| Skala | Metrisk, nere till vänster |
| Fyndnålar | Färgad efter art. Väntande (köade) fynd visas streckade och halvgenomskinliga |

### 4.3 Nytt fynd

Knappen **Nytt fynd** öppnar ett bottenblad med följande fält:

| Fält | Beteende |
|---|---|
| Art | Chips med färgprick. Senast valda art är förvald (`svamp-last-art`) |
| Mängd | 1 Enstaka · 2 Lite · 3 Lagom (standard) · 4 Mycket · 5 Massor |
| Plats | GPS-position med noggrannhet, annars kartans mitt. **Ändra** öppnar placeringsläge |
| Datum och tid | Nu som standard, går att ändra för fynd som registreras i efterhand |
| Foto | Ta eller välj foto. Förhandsbild och storlek i kB visas |
| Anteckning | Fritext |

**Placeringsläge:** användaren drar kartan så att den fasta nålen hamnar rätt och väljer **Använd platsen** eller **Avbryt**. Fyndet markeras då som `placerad = true`.

**Arter** (`arter.js`): Kantarell, Trattkantarell, Svart trumpetsvamp, Karljohan, Annan sopp, Blodriska, Fårticka, Blek taggsvamp, Kremla, Rödgul trumpetsvamp, Murkla, Annan.

### 4.4 Foton

- Bilden avkodas med `createImageBitmap`. Som reserv används ett `<img>`-element, som klarar HEIC i Safari.
- Bilden krymps stegvis till JPEG tills den är **≤ 250 kB**: 1280 px/0,72 → 1280/0,60 → 1024/0,60 → 900/0,55.
- Originalbilden laddas **aldrig** upp. Kan bilden inte läsas ombeds användaren välja ett annat foto.
- Fotot sparas i den privata bucketen `svamp-foton` som `<user_id>/<fynd-id>.jpg`.
- I popupen visas fotot via en signerad URL som gäller i 1 timme och cachas i 50 minuter. Ett tryck på bilden öppnar den i full storlek.
- Med 1 GB gratis lagring räcker utrymmet till cirka 4 000–6 000 foton. Vid start visas hur mycket fotona tar, till exempel ”foton 2,4 MB av 1 024”.

### 4.5 Visa och ta bort fynd

- Popupen visar foto, art, datum, mängd, väder och anteckning.
- **Ta bort** kräver bekräftelse och raderar både raden och fotot.
- Ett köat fynd som tas bort raderas bara lokalt.

### 4.6 Väder vid fyndet

- Vid sparande hämtas data för de **10 dygn som slutar på fyndets datum**:
  - `regn_10d`: summerad nederbörd i mm
  - `temp_snitt`: medel av dygnens max- och mintemperatur
  - `regn_dagar`, `fran`, `till`, `kalla`
- Fynd som är yngre än cirka 85 dagar hämtas från `api.open-meteo.com/v1/forecast`, äldre från `archive-api.open-meteo.com/v1/archive`.
- Timeouten är 8 s. Misslyckas hämtningen sparas fyndet ändå med `vader = null`.
- **Komplettering:** när fynden hämtas fylls väder i för upp till 20 fynd som saknar det.
- Popupen visar till exempel ”Regn 10 d: 17 mm · 8,4 °C”.

### 4.7 Offline

**Offline-kö (`ko.js`)**
1. Varje fynd sparas **först** i IndexedDB (`svampkartan` / `ko`), därefter görs ett försök att ladda upp.
2. Foton lagras som **ArrayBuffer**, eftersom Safari i privat läge och WebKit inte kan lagra Blob i IndexedDB.
3. Uppladdningen sker i ordningen foto → väder (om det saknas) → `upsert` av raden. Det betyder att ett avbrutet försök kan göras om utan dubbletter.
4. Synk sker vid inloggning, vid `online`, när appen blir synlig, varje 60:e sekund och vid tryck på räknaren.
5. Räknaren ”N väntar” i toppen visar antalet köade fynd.

**Meddelanden vid sparande**
- ”Trattkantarell sparad”: uppladdat direkt.
- ”… sparad i telefonen – laddas upp när du har täckning”: köat.
- ”… sparad i telefonen. Uppladdning misslyckades: …”: annat fel än nätverksfel.

**Fyndlista offline:** den senaste listan från servern sparas i `localStorage` (`svamp-fynd-cache`) och visas när servern inte nås, tillsammans med köade fynd.

**Service worker (`sw.js`)**

| Resurs | Strategi |
|---|---|
| Sidladdning | Nätet först, annars cachad `index.html` |
| Egna filer | Nätet först, annars cache |
| CDN (jsdelivr, unpkg, cdnjs) | Cache först |
| Kartrutor | Cache först i `svampkartan-tiles`, max 1 500 rutor |
| Supabase och övrig extern trafik | Ingen cache |
| `/rapport/` | Ignoreras helt |

- Cache-namnet (`svampkartan-vN`) höjs vid ändringar.
- Appen laddar om sig själv en gång när en ny service worker tar över.

---

## 5. Data

### 5.1 Supabase-projekt

Svampkartan delar **Jaktvinds Supabase-projekt**, eftersom gratisnivån bara tillåter två projekt. För att inget ska krocka gäller:
- Allt eget har prefixet `svamp_`, och bucketen heter `svamp-foton`.
- Jaktvinds tabeller (`logg`, `platser`) och inställningar rörs inte.

### 5.2 Tabell `public.svamp_fynd`

| Kolumn | Typ | Regel |
|---|---|---|
| `id` | text, PK | Skapas i appen (UUID), så att fynd kan sparas offline |
| `user_id` | uuid | `default auth.uid()`, FK till `auth.users`, cascade |
| `funnen_at` | timestamptz | Standard `now()` |
| `art` | text | Art-id |
| `mangd` | smallint | 1–5, standard 3 |
| `anteckning` | text | |
| `lat` / `lon` | double precision | Giltigt intervall |
| `noggrannhet` | real | GPS-noggrannhet i meter |
| `placerad` | boolean | `true` om fyndet placerats för hand |
| `foto_path` | text | Sökväg i `svamp-foton` |
| `vader` | jsonb | Se 4.6 |
| `created_at` / `updated_at` | timestamptz | |

Index: `(user_id, funnen_at desc)` och `(user_id, art)`.

### 5.3 Behörigheter

- RLS är på. `select`, `insert`, `update` och `delete` tillåts bara där `auth.uid() = user_id`.
- `anon` har inga rättigheter. `authenticated` och `service_role` har uttryckliga `GRANT`.
- Bucketen `svamp-foton` är privat och har en gräns på 1 MB per fil. Tillåtna typer är jpeg, png, webp och heic. Användaren kommer bara åt sin egen mapp (`<user_id>/…`).

---

## 6. Lokal lagring i webbläsaren

| Nyckel | Innehåll |
|---|---|
| `svamp-theme` | `light` / `dark` (saknas = auto) |
| `svamp-map-view` | Kartans centrum och zoom |
| `svamp-map-layer` | Valt baslager |
| `svamp-map-trails` | Vandringsleder på (`1`) eller av |
| `svamp-last-art` | Senast valda art |
| `svamp-fynd-cache` | Senaste fyndlistan från servern |
| IndexedDB `svampkartan/ko` | Köade fynd med foto |

All åtkomst till `localStorage` är inlindad i try/catch.

---

## 7. Test och CI

### 7.1 Testsvit (Playwright)

- Testerna körs på **iPhone 14 (WebKit)** och **Pixel 7 (Chromium)** med svensk locale, tidszonen Europe/Stockholm och en mockad GPS-position på Gräsö.
- **All extern trafik mockas** (`tests/mock.js`): Supabase-auth, REST och Storage, CDN-bibliotek (serveras från `node_modules`), kartrutor och Open-Meteo. Testerna rör aldrig riktig data och behöver inga nycklar.
- Service workers är blockerade i testerna.
- Fixturer (`tests/hjalp.js`): `api` ger databasens tillstånd och loggade anrop, `kartan` ger en inloggad sida där kartan är laddad, och `bild()` bifogar skärmdumpar till rapporten.

| Fil | Tester |
|---|---|
| `inloggning.spec.js` (6) | Visar inloggning · fel lösenord · ogiltig e-post skickas inte · rätt uppgifter ger kartan · sessionen finns kvar efter omladdning · logga ut |
| `karta.spec.js` (5) | Nålar och antal · lagerväljaren · valt lager sparas · popup med väder och foto · positionsknappen |
| `fynd.spec.js` (6) | Spara med art, mängd, anteckning och foto · fotot krymps till ≤ 250 kB · senaste art förvald · placering för hand · ta bort fynd och foto · avbryt borttagning |
| `offline.spec.js` (3) | Fynd med foto köas och laddas upp · kön finns kvar efter omstart · cachad lista när servern inte nås |
| `tema.spec.js` (3) | Växla och spara tema · följer telefonens mörka läge · Kantarell-färger i ljust läge |

Totalt blir det 23 tester × 2 enheter = 46 körningar.

### 7.2 Testrapport

En egen reporter (`tests/rapport-reporter.js`) skapar `rapport/index.html` i Kantarell-stil. Den innehåller:
- Status med procentring, commit-meddelande, SHA, gren och länk till körningen.
- Nyckeltal: antal tester, godkända, misslyckade och tid.
- Trend över de senaste 30 körningarna (`historik.json` hämtas från den publicerade sidan före varje körning).
- Ett galleri med skärmdumpar, där iPhone-bilder visas i första hand.
- Tester per grupp med status per enhet. Misslyckade tester fälls ut automatiskt med felmeddelande och skärmdump.
- En länk till Playwrights HTML-rapport med trace (`rapport/playwright/`).
- En sammanfattning i GitHub Actions (job summary).

Rapporten finns på https://dennishoglund.github.io/svampkartan/rapport/

### 7.3 CI/CD (`.github/workflows/tester.yml`)

- Körs vid **varje push till `main`** och manuellt (`workflow_dispatch`).
- Stegen är: `npm ci` → installera WebKit och Chromium → hämta historik → kör tester (`continue-on-error`) → bygg `_site` (app + rapport, utan tester och node_modules) → spara rapporten som artefakt i 14 dagar → publicera på GitHub Pages → markera commiten som röd om något test föll.
- I CI används 1 omförsök och 2 workers.
- **GitHub Pages:** Source är satt till **GitHub Actions**.
- Appen publiceras även om testerna faller. En möjlig ändring är att bara publicera när alla tester är gröna.

---

## 8. Driftsättning och inställningar

1. Repo `svampkartan`, där Pages publiceras via GitHub Actions.
2. `config.js` pekar på Jaktvinds Supabase-projekt och dess publishable-nyckel.
3. `supabase/schema.sql` körs i SQL Editor. Filen går att köra flera gånger.
4. Installation på iPhone: Safari → Dela → Lägg till på hemskärmen.

---

## 9. Beslut

| Beslut | Motivering |
|---|---|
| PWA i stället för native | Ingen Mac behövs, samma stack som Jaktvind och Virkesfynd |
| Kantarell-design i stället för Skog | Ska skilja sig från de andra apparna. Ljus är lättläst i sol, och mörkt läge finns ändå |
| Delat Supabase-projekt med prefix | Gratisnivån tillåter bara två projekt |
| Lösenord i stället för e-postkod | Egna mejlmallar kräver SMTP. Samma konto som i Jaktvind |
| Spara lokalt först, sedan ladda upp | Inget fynd ska försvinna utan täckning |
| Foton ≤ 250 kB som ArrayBuffer i kön | Räcker långt inom 1 GB och fungerar i alla Safari-lägen |
| Mockad backend i testerna | Snabba och stabila tester som aldrig rör riktig data |

---

## 10. Kvar att göra

- [ ] **Steg 7, filter och säsong:** filtrera kartan på art och år, och en säsongsvy som visar när och efter hur mycket regn varje art hittas.
- [ ] Kartan som i Jaktvind: Stigar som startlager och samma ordning i lagerlistan (valfritt).
- [ ] Publicera bara när alla tester är gröna (valfritt).
- [ ] Ladda ner kartrutor i förväg för valda områden (valfritt).
