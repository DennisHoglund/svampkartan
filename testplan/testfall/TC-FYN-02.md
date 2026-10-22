[← Testplan](../index.md)

# TC-FYN-02 · Fotot krymps innan uppladdning

| | |
|---|---|
| **Område** | Nytt fynd och foton |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.3–4.5](../../SPEC.md) |
| **Playwright** | [`tests/fynd.spec.js`](../../tests/fynd.spec.js#L35) – *fotot krymps innan uppladdning* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck **Nytt fynd** och välj ett stort foto (flera MB) | – |
| 2 | Läs texten bredvid förhandsbilden | Storleken är högst 250 kB |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
