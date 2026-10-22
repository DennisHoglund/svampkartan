[← Testplan](../index.md)

# TC-INL-06 · Logga ut

| | |
|---|---|
| **Område** | Inloggning |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.1](../../SPEC.md) |
| **Playwright** | [`tests/inloggning.spec.js`](../../tests/inloggning.spec.js#L48) – *logga ut tar en tillbaka till inloggningen* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck **Logga ut** uppe till höger | Inloggningssidan visas |
| 2 | Ladda om sidan | Inloggningssidan visas fortfarande |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
