[← Testplan](../index.md)

# TC-INL-01 · Inloggningen visas när man inte är inloggad

| | |
|---|---|
| **Område** | Inloggning |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.1](../../SPEC.md) |
| **Playwright** | [`tests/inloggning.spec.js`](../../tests/inloggning.spec.js#L5) – *visar inloggningen när man inte är inloggad* |

## Förutsättningar

- Utloggad (tryck **Logga ut** eller öppna i privat flik)

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna appen | Inloggningssidan visas med ikonen, rubriken **Svampkartan**, fälten E-post och Lösenord |
| 2 | Kontrollera att kartan inte syns | Varken karta eller knappen **Nytt fynd** visas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
