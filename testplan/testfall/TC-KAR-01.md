[← Testplan](../index.md)

# TC-KAR-01 · Mina fynd visas som nålar

| | |
|---|---|
| **Område** | Karta |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.2](../../SPEC.md) |
| **Playwright** | [`tests/karta.spec.js`](../../tests/karta.spec.js#L4) – *visar mina fynd som nålar och antal i toppen* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Minst ett sparat fynd finns på kartan

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna appen | Kartan visas med en nål per fynd, färgad efter art (kantarell gul, karljohan brun …) |
| 2 | Titta högst upp | Antal fynd visas en kort stund |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
