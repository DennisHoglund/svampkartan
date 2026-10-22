[← Testplan](../index.md)

# TC-OFF-03 · Fynd visas när servern inte nås

| | |
|---|---|
| **Område** | Offline |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.7](../../SPEC.md) |
| **Playwright** | [`tests/offline.spec.js`](../../tests/offline.spec.js#L47) – *visar senast hämtade fynd när servern inte nås* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Minst ett sparat fynd finns på kartan
- Appen öppnad minst en gång med täckning

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Slå på flygplansläge | – |
| 2 | Öppna appen | *Ingen täckning – visar sparade fynd* och alla nålar syns |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
