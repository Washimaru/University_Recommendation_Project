# UniMatch — holistic university recommender

A self-contained website that recommends universities by hard limits first
(major, budget, public/private), then ranks the survivors by *fit* — campus
culture and learning style — using a weighted cosine-similarity model.

## Running it

**Quick way (everything except live OLAP SQL):**
Double-click `index.html`. The matcher, 300+ school profiles, tabbed detail
modals, favorites, compare tray, and the Explore charts all work — the Explore
panel just computes its aggregations in plain JavaScript.

**Full way (real DuckDB-WASM OLAP engine in the Explore panel):**
Browsers only load the DuckDB WebAssembly engine over `http`, not from a
`file://` page. So to get the *real* in-browser SQL database:

- **macOS:** double-click `start-server.command`, then visit the page it opens
  (`http://localhost:8000`).
- **Any OS (terminal):** from this folder run `python3 -m http.server 8000`
  and open `http://localhost:8000`.

In the Explore panel, the "Engine" line tells you which one answered:
`DuckDB-WASM · columnar OLAP engine` (served over http) or the JS fallback.

## Project structure

```
index.html        markup + script wiring
css/styles.css    design system, theming, components
js/data.js        core university dataset
js/data2.js       expansion: more US + international schools
js/data3.js       niche/specialized schools (music, art, film, theatre)
js/details.js     10-category detail layer: estimator + curated real FACTS
js/engine.js      dual-layer matching (hard constraints + soft cosine score)
js/db.js          OLAP layer — loads the data into DuckDB-WASM (+ JS fallback)
js/app.js         UI controller: wizard, results, modal, compare, Explore
```

## Data accuracy

Each school profile is marked **✓ Verified facts** (hand-curated from the
school's published Common Data Set / official pages — the detail modal links
the source and year) or **~ Smart estimates** (reasoned values derived from the
school's profile). Always confirm specifics on the official site before
making decisions.
