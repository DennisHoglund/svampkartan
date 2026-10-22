[← Testplan](../index.md)

# TC-TEM-01 · Temaknappen växlar och sparar valet

| | |
|---|---|
| **Område** | Tema och design |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 3.1](../../SPEC.md) |
| **Playwright** | [`tests/tema.spec.js`](../../tests/tema.spec.js#L4) – *temaknappen växlar Auto → Ljust → Mörkt och sparar valet* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på temaknappen uppe till höger | Texten blir **Ljust** och appen ljus |
| 2 | Tryck igen | **Mörkt** – appen blir mörkbrun |
| 3 | Stäng och öppna appen | Mörkt läge är kvar |
| 4 | Tryck igen | **Auto** – följer telefonen |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
