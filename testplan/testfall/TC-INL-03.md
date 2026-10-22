[← Testplan](../index.md)

# TC-INL-03 · Ogiltig e-post stoppas innan något skickas

| | |
|---|---|
| **Område** | Inloggning |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.1](../../SPEC.md) |
| **Playwright** | [`tests/inloggning.spec.js`](../../tests/inloggning.spec.js#L23) – *ogiltig e-post stoppas innan något skickas* |

## Förutsättningar

- Utloggad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Skriv `inte-en-adress` i E-post | – |
| 2 | Fyll i valfritt lösenord och tryck **Logga in** | Röd text: *Ange en giltig e-postadress.* Inget inloggningsförsök görs |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
