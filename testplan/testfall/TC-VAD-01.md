[← Testplan](../index.md)

# TC-VAD-01 · Väder sparas med nytt fynd

| | |
|---|---|
| **Område** | Väder |
| **Prioritet** | Medel |
| **Typ** | 🖐️ Manuell |
| **Krav** | [SPEC.md avsnitt 4.6](../../SPEC.md) |

## Förutsättningar

- Inloggad i appen med ditt Jaktvind-konto
- Täckning

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Spara ett nytt fynd | – |
| 2 | Tryck på nålen | Popupen visar *Regn 10 d: X mm · Y °C* |
| 3 | Jämför med SMHI för senaste veckan (valfritt) | Regnmängden är rimlig |

> Automatiserade tester använder mockat väder (16,5 mm). Det här testfallet kontrollerar riktiga Open-Meteo.

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
