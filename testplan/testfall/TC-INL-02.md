[← Testplan](../index.md)

# TC-INL-02 · Fel lösenord ger tydligt felmeddelande

| | |
|---|---|
| **Område** | Inloggning |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.1](../../SPEC.md) |
| **Playwright** | [`tests/inloggning.spec.js`](../../tests/inloggning.spec.js#L13) – *fel lösenord ger ett tydligt felmeddelande* |

## Förutsättningar

- Utloggad

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Fyll i din e-post | – |
| 2 | Fyll i ett felaktigt lösenord | – |
| 3 | Tryck **Logga in** | Röd text: *Fel e-post eller lösenord.* Du är kvar på inloggningssidan |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
