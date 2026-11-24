# Urban Spec — plakatserie

Fem printklare A4-plakater til Travel2Berlin. Åbn `index.html` i en browser for at se dem alle.

| Fil | Plakat |
| --- | --- |
| `fernsehturm-tech-spec.html` | Fernsehturm — Tech Spec (Urban Spec / 01) |
| `berlin-index.html` | BERLIN — Typographic index (Urban Spec / 02) |
| `berlin-grid.html` | Variant A — Letter grid |
| `berlin-divided.html` | Variant B — Divided city (mørk) |
| `berlin-1237.html` | Variant C — 1237 beskåret |

**PDF:** åbn en plakat, vælg Udskriv → Gem som PDF. Siden er sat til A4 uden margen; slå "Baggrundsgrafik" til, hvis browseren spørger.

**Farver:** alle farver ligger som variabler øverst i `assets/posters.css`. En enkelt plakats accent- eller baggrundsfarve ændres i dens egen `<style>`-blok (`--accent`, `--ground`, `--paper`).

## Salgspakker til download

`berlin-index.html` er en fleksibel skabelon: højden følger det valgte format (`?ratio=iso|5x7|2x3|3x4|4x5`), så layoutet lægges om i stedet for at blive beskåret.

Byg pakkerne (kræver Node og Playwright: `npm install` første gang):

    npm run export

Det giver for hver plakat i `dist/`:
- `<plakat>.zip`: den fil kunden downloader. Den indeholder en vektor-PDF og en 300 dpi JPG for hvert af de 5 formater plus en printvejledning (HOW-TO-PRINT.txt).
- `<plakat>/<plakat>_preview.png`: produktbillede til shoppen (1600×2000).

Hvilke plakater der eksporteres, styres af listen `PRODUCTS` øverst i `scripts/export.cjs`.
