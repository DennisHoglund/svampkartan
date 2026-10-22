[← Testplan](../index.md)

# TC-FYN-04 · Placera fynd för hand på kartan

| | |
|---|---|
| **Område** | Nytt fynd och foton |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.3–4.5](../../SPEC.md) |
| **Playwright** | [`tests/fynd.spec.js`](../../tests/fynd.spec.js#L53) – *fynd kan placeras för hand på kartan* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck **Nytt fynd** och sedan **Ändra** vid Plats | Formuläret döljs, en gul nål står mitt på kartan |
| 2 | Dra kartan så att nålen hamnar där fyndet var | – |
| 3 | Tryck **Använd platsen** | Formuläret visas igen med *Placerad på kartan* |
| 4 | Tryck **Spara fynd** | Nålen hamnar på vald plats |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
