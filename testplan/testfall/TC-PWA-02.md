[← Testplan](../index.md)

# TC-PWA-02 · Ny version laddas automatiskt

| | |
|---|---|
| **Område** | Installation och uppdatering |
| **Prioritet** | Medel |
| **Typ** | 🖐️ Manuell |
| **Krav** | [SPEC.md avsnitt 4.7, 8](../../SPEC.md) |

## Förutsättningar

- Appen installerad
- En ny version har pushats och CI är grön

## Steg

| # | Gör så här | Förväntat resultat |
|---|---|---|
| 1 | Öppna appen med täckning | Appen laddar om sig själv en gång |
| 2 | Kontrollera att ändringen syns | Den nya versionen används |

> Service workers är avstängda i de automatiserade testerna.

## Resultat

- [ ] Godkänt
- [ ] Underkänt – notera vad som hände:
