[← Testplan](../index.md)

# TC-KAR-04 · Popup visar fyndets detaljer och foto

| | |
|---|---|
| **Område** | Karta |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.2](../../SPEC.md) |
| **Playwright** | [`tests/karta.spec.js`](../../tests/karta.spec.js#L30) – *popup visar art, väder, anteckning och foto* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Minst ett sparat fynd med foto finns

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på nålen för ett fynd med foto | En popup öppnas |
| 2 | Kontrollera innehållet | Foto, art, datum, mängd, väderrad (*Regn 10 d: … mm · … °C*) och anteckning |
| 3 | Tryck på fotot | Fotot öppnas i full storlek |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
