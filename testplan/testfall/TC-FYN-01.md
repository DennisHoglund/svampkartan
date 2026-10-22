[← Testplan](../index.md)

# TC-FYN-01 · Spara fynd med art, mängd, anteckning och foto

| | |
|---|---|
| **Område** | Nytt fynd och foton |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.3–4.5](../../SPEC.md) |
| **Playwright** | [`tests/fynd.spec.js`](../../tests/fynd.spec.js#L7) – *sparar ett fynd med art, mängd, anteckning och foto* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck **Nytt fynd** | Formuläret öppnas nerifrån |
| 2 | Välj art **Trattkantarell** | Chipet markeras |
| 3 | Välj mängd **5 Massor** | Knappen blir gul |
| 4 | Skriv en anteckning | – |
| 5 | Tryck **Ta eller välj foto** och välj en bild | Förhandsbild och *Byt foto (… kB)* visas |
| 6 | Tryck **Spara fynd** | Formuläret stängs och *Trattkantarell sparad* visas |
| 7 | Tryck på den nya nålen | Popupen visar art, mängd, anteckning, foto och väder |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
