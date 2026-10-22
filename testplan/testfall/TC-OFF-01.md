[← Testplan](../index.md)

# TC-OFF-01 · Fynd utan täckning laddas upp senare

| | |
|---|---|
| **Område** | Offline |
| **Prioritet** | Hög |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 4.7](../../SPEC.md) |
| **Playwright** | [`tests/offline.spec.js`](../../tests/offline.spec.js#L4) – *fynd sparas i telefonen och laddas upp när täckningen kommer tillbaka* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Slå på **flygplansläge** | – |
| 2 | Tryck **Nytt fynd**, välj art, foto och tryck **Spara fynd** | *… sparad i telefonen – laddas upp när du har täckning* |
| 3 | Titta på kartan och toppen | Nålen är streckad och gul räknare visar *1 väntar* |
| 4 | Slå av flygplansläge och vänta upp till en minut | *1 fynd uppladdat* visas, räknaren försvinner och nålen blir hel |
| 5 | Tryck på nålen | Foto och väder visas |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
