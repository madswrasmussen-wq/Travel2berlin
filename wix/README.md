# Wix-sider (HTML-embeds)

| Fil | Side på travel2berlin.com |
| --- | --- |
| `posters.html` | Ny side: /posters |
| `berlin-walks.html` | Eksisterende /berlin-walks (opdateret, så plakater ikke vises her) |

Begge sider henter produkterne direkte fra Wix Stores. Nye produkter vises automatisk, og der skal ikke ændres i koden.

## Regel for plakater

Et produkt er en plakat, når **navnet starter med "Poster"**. Så vises det på /posters og ikke på /berlin-walks.

- **Navn:** `Poster: BERLIN — Typographic Index`. Teksten før tankestregen bliver overskriften, og teksten efter bliver den gyldne kursiv-linje.
- **Beskrivelse:** Første sætning bliver teksten på kortet. Skriv den som én kort sætning.
- **Billede:** Det første produktbillede, helst i formatet 4:5. Det er `*_preview.png` fra eksporten.
- **Fil:** zip-filen fra `posters/dist/`.
- **Rækkefølge:** Den ældste plakat vises først, så numrene (Urban Spec / 01, 02 …) ikke ændrer sig. Den nyeste vises også øverst på siden.

## Sæt siden op (første gang)

1. Wix Editor → tilføj en ny side, "Posters" (URL: /posters).
2. Tilføj → Embed code → Embed HTML. Indsæt hele `posters.html` under "Code".
3. Gør elementet fuld bredde, og sæt højden, så hele siden kan ses. Højden skal gøres større, når der kommer flere plakater (ca. 650 px pr. ny række med tre plakater).
4. Opdatér også HTML-embeddet på /berlin-walks med den nye `berlin-walks.html`.
5. Save → Publish.
