# Testplan · Svampkartan

Testfall för Svampkartan som docs-as-code. Varje testfall har steg-för-steg-instruktioner så att det kan köras manuellt på telefonen.
Automatiserade testfall körs dessutom av Playwright vid varje commit och är kopplade via sitt ID.

| | |
|---|---|
| **Testfall** | 31 |
| **Automatiserade** | 23 (körs på iPhone/WebKit och Android/Chromium) |
| **Manuella** | 8 (kräver riktig iPhone, kamera, GPS eller riktig backend) |
| **Senaste testrapport** | [dennishoglund.github.io/svampkartan/rapport/](https://dennishoglund.github.io/svampkartan/rapport/) |
| **Krav** | [SPEC.md](../SPEC.md) |

**Typ:** 🤖 automatiserad · 🖐️ manuell  **Prioritet:** Hög = måste fungera i skogen, Medel = viktig, Låg = bekvämlighet

## Inloggning

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-INL-01](testfall/TC-INL-01.md) | [Inloggningen visas när man inte är inloggad](testfall/TC-INL-01.md) | Hög | 🤖 |
| [TC-INL-02](testfall/TC-INL-02.md) | [Fel lösenord ger tydligt felmeddelande](testfall/TC-INL-02.md) | Hög | 🤖 |
| [TC-INL-03](testfall/TC-INL-03.md) | [Ogiltig e-post stoppas innan något skickas](testfall/TC-INL-03.md) | Medel | 🤖 |
| [TC-INL-04](testfall/TC-INL-04.md) | [Rätt uppgifter loggar in och visar kartan](testfall/TC-INL-04.md) | Hög | 🤖 |
| [TC-INL-05](testfall/TC-INL-05.md) | [Inloggningen finns kvar efter omstart](testfall/TC-INL-05.md) | Hög | 🤖 |
| [TC-INL-06](testfall/TC-INL-06.md) | [Logga ut](testfall/TC-INL-06.md) | Medel | 🤖 |
| [TC-INL-07](testfall/TC-INL-07.md) | [Lösenordet fylls i med Face ID](testfall/TC-INL-07.md) | Låg | 🖐️ |

## Karta

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-KAR-01](testfall/TC-KAR-01.md) | [Mina fynd visas som nålar](testfall/TC-KAR-01.md) | Hög | 🤖 |
| [TC-KAR-02](testfall/TC-KAR-02.md) | [Lagerväljaren har fyra kartor och vandringsleder](testfall/TC-KAR-02.md) | Medel | 🤖 |
| [TC-KAR-03](testfall/TC-KAR-03.md) | [Valt kartlager sparas](testfall/TC-KAR-03.md) | Medel | 🤖 |
| [TC-KAR-04](testfall/TC-KAR-04.md) | [Popup visar fyndets detaljer och foto](testfall/TC-KAR-04.md) | Hög | 🤖 |
| [TC-KAR-05](testfall/TC-KAR-05.md) | [Positionsknappen visar var jag är](testfall/TC-KAR-05.md) | Hög | 🤖 |
| [TC-KAR-06](testfall/TC-KAR-06.md) | [GPS-noggrannhet ute i skogen](testfall/TC-KAR-06.md) | Medel | 🖐️ |

## Nytt fynd och foton

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-FYN-01](testfall/TC-FYN-01.md) | [Spara fynd med art, mängd, anteckning och foto](testfall/TC-FYN-01.md) | Hög | 🤖 |
| [TC-FYN-02](testfall/TC-FYN-02.md) | [Fotot krymps innan uppladdning](testfall/TC-FYN-02.md) | Hög | 🤖 |
| [TC-FYN-03](testfall/TC-FYN-03.md) | [Senast valda art är förvald](testfall/TC-FYN-03.md) | Låg | 🤖 |
| [TC-FYN-04](testfall/TC-FYN-04.md) | [Placera fynd för hand på kartan](testfall/TC-FYN-04.md) | Medel | 🤖 |
| [TC-FYN-05](testfall/TC-FYN-05.md) | [Ta bort fynd raderar fynd och foto](testfall/TC-FYN-05.md) | Hög | 🤖 |
| [TC-FYN-06](testfall/TC-FYN-06.md) | [Avbryta borttagning behåller fyndet](testfall/TC-FYN-06.md) | Medel | 🤖 |
| [TC-FYN-07](testfall/TC-FYN-07.md) | [Foto direkt med kameran](testfall/TC-FYN-07.md) | Hög | 🖐️ |

## Väder

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-VAD-01](testfall/TC-VAD-01.md) | [Väder sparas med nytt fynd](testfall/TC-VAD-01.md) | Medel | 🖐️ |
| [TC-VAD-02](testfall/TC-VAD-02.md) | [Väder fylls i för gamla fynd](testfall/TC-VAD-02.md) | Låg | 🖐️ |

## Offline

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-OFF-01](testfall/TC-OFF-01.md) | [Fynd utan täckning laddas upp senare](testfall/TC-OFF-01.md) | Hög | 🤖 |
| [TC-OFF-02](testfall/TC-OFF-02.md) | [Köade fynd finns kvar efter omstart](testfall/TC-OFF-02.md) | Hög | 🤖 |
| [TC-OFF-03](testfall/TC-OFF-03.md) | [Fynd visas när servern inte nås](testfall/TC-OFF-03.md) | Medel | 🤖 |
| [TC-OFF-04](testfall/TC-OFF-04.md) | [Kartan fungerar i skogen utan täckning](testfall/TC-OFF-04.md) | Medel | 🖐️ |

## Tema och design

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-TEM-01](testfall/TC-TEM-01.md) | [Temaknappen växlar och sparar valet](testfall/TC-TEM-01.md) | Medel | 🤖 |
| [TC-TEM-02](testfall/TC-TEM-02.md) | [Mörkt läge följer telefonen](testfall/TC-TEM-02.md) | Medel | 🤖 |
| [TC-TEM-03](testfall/TC-TEM-03.md) | [Ljust läge har Kantarell-färgerna](testfall/TC-TEM-03.md) | Låg | 🤖 |

## Installation och uppdatering

| ID | Testfall | Prio | Typ |
|---|---|---|---|
| [TC-PWA-01](testfall/TC-PWA-01.md) | [Installera på hemskärmen](testfall/TC-PWA-01.md) | Hög | 🖐️ |
| [TC-PWA-02](testfall/TC-PWA-02.md) | [Ny version laddas automatiskt](testfall/TC-PWA-02.md) | Medel | 🖐️ |

## Så lägger du till ett testfall

1. Skapa `testfall/TC-<OMRÅDE>-<NR>.md` (kopiera ett befintligt).
2. Lägg till raden i tabellen ovan.
3. Om det automatiseras: ge Playwright-testet annotationen `{ annotation: { type: 'testfall', description: 'TC-…' } }`.
   ID:t visas då i testrapporten med länk hit, och CI kontrollerar att varje ID finns som fil.
