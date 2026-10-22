[← Testplan](../index.md)

# TC-FYN-03 · Senast valda art är förvald

| | |
|---|---|
| **Område** | Nytt fynd och foton |
| **Prioritet** | Låg |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.3–4.5](../../SPEC.md) |
| **Playwright** | [`tests/fynd.spec.js`](../../tests/fynd.spec.js#L44) – *senast valda art är förvald nästa gång* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Spara ett fynd med art **Karljohan** | *Karljohan sparad* |
| 2 | Tryck **Nytt fynd** igen | Karljohan är redan vald |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
