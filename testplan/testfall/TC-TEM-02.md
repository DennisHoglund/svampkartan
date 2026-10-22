[← Testplan](../index.md)

# TC-TEM-02 · Mörkt läge följer telefonen

| | |
|---|---|
| **Område** | Tema och design |
| **Prioritet** | Medel |
| **Typ** | 🤖 Automatiserad |
| **Krav** | [SPEC.md avsnitt 3.1](../../SPEC.md) |
| **Playwright** | [`tests/tema.spec.js`](../../tests/tema.spec.js#L17) – *mörkt läge följer telefonens inställning* |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Temaknappen står på **Auto**

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Slå på mörkt läge i iPhone (Inställningar → Skärm och ljusstyrka) | – |
| 2 | Öppna appen | Mörkbrun bakgrund, gula detaljer, kartan något dämpad |

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
