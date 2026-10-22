[← Testplan](../index.md)

# TC-KAR-03 · Valt kartlager sparas

| | |
|---|---|
| **Område** | Karta |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.2](../../SPEC.md) |
| **Playwright** | [`tests/karta.spec.js`](../../tests/karta.spec.js#L20) – *valt kartlager sparas till nästa gång* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Välj **Satellit** i lagerväljaren | Kartan visar flygbilder |
| 2 | Stäng appen helt och öppna igen | Kartan startar med Satellit |
| 3 | Slå på **Vandringsleder**, stäng och öppna igen | Vandringsleder är fortfarande påslaget |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
