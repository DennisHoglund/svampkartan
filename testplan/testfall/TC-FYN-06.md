[← Testplan](../index.md)

# TC-FYN-06 · Avbryta borttagning behåller fyndet

| | |
|---|---|
| **Område** | Nytt fynd och foton |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.3–4.5](../../SPEC.md) |
| **Playwright** | [`tests/fynd.spec.js`](../../tests/fynd.spec.js#L76) – *avbryta borttagning behåller fyndet* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Minst ett sparat fynd finns på kartan

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på nålen och sedan **Ta bort** | Frågan visas |
| 2 | Tryck **Avbryt** | Nålen finns kvar |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
