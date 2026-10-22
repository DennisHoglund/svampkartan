[← Testplan](../index.md)

# TC-INL-05 · Inloggningen finns kvar efter omstart

| | |
|---|---|
| **Område** | Inloggning |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.1](../../SPEC.md) |
| **Playwright** | [`tests/inloggning.spec.js`](../../tests/inloggning.spec.js#L42) – *inloggningen finns kvar efter omladdning* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Stäng appen helt (svep upp och bort) | – |
| 2 | Öppna appen igen från hemskärmen | Kartan visas direkt utan att du behöver logga in |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
