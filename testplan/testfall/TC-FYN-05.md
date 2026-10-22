[← Testplan](../index.md)

# TC-FYN-05 · Ta bort fynd raderar fynd och foto

| | |
|---|---|
| **Område** | Nytt fynd och foton |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.3–4.5](../../SPEC.md) |
| **Playwright** | [`tests/fynd.spec.js`](../../tests/fynd.spec.js#L65) – *ta bort fynd raderar både fynd och foto* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Minst ett sparat fynd med foto finns

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Tryck på nålen och sedan **Ta bort** | Frågan *Ta bort fyndet?* visas |
| 2 | Tryck **OK** | *Fyndet borttaget* visas och nålen försvinner |
| 3 | (Valfritt) Kontrollera i Supabase → Storage → svamp-foton | Fotot är borta |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
