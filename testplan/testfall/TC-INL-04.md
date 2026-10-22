[← Testplan](../index.md)

# TC-INL-04 · Rätt uppgifter loggar in och visar kartan

| | |
|---|---|
| **Område** | Inloggning |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.1](../../SPEC.md) |
| **Playwright** | [`tests/inloggning.spec.js`](../../tests/inloggning.spec.js#L32) – *rätt uppgifter loggar in och visar kartan med fynd* |

## Förutsättningar

- Utloggad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Fyll i e-post och lösenord för ditt Jaktvind-konto | – |
| 2 | Tryck **Logga in** | Kartan visas med dina fynd som nålar |
| 3 | Titta högst upp | En ruta visar t.ex. *3 fynd på kartan · foton 0,5 MB av 1 024* |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
