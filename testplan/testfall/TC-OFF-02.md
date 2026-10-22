[← Testplan](../index.md)

# TC-OFF-02 · Köade fynd finns kvar efter omstart

| | |
|---|---|
| **Område** | Offline |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.7](../../SPEC.md) |
| **Playwright** | [`tests/offline.spec.js`](../../tests/offline.spec.js#L33) – *köade fynd finns kvar efter omstart av appen* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Slå på flygplansläge och spara ett fynd | *1 väntar* |
| 2 | Stäng appen helt och öppna igen (fortfarande flygplansläge) | Räknaren visar *1 väntar* och nålen syns streckad |
| 3 | Slå av flygplansläge | Fyndet laddas upp |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
