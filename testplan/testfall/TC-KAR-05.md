[← Testplan](../index.md)

# TC-KAR-05 · Positionsknappen visar var jag är

| | |
|---|---|
| **Område** | Karta |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.2](../../SPEC.md) |
| **Playwright** | [`tests/karta.spec.js`](../../tests/karta.spec.js#L42) – *positionsknappen visar var jag är* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Platstjänster tillåtna för Safari

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna appen | En blå punkt visar din position |
| 2 | Dra kartan en bit bort | Kartan slutar följa dig |
| 3 | Tryck på positionsknappen nere till höger | Kartan centreras på dig och knappen blir blå |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
